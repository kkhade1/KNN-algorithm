import cors from 'cors';

import express from 'express';
import bodyparser from 'body-parser';
import assert from 'assert';
import STATUS from 'http-status';

import { ok, err } from 'cs544-js-utils';
import { knn } from 'prj1-sol';
import { uint8ArrayToB64, b64ToUint8Array } from 'prj2-sol';

import fs from 'fs';
import http from 'http';
import https from 'https';

export const DEFAULT_COUNT = 5;

/** Start KNN server.  If trainData is specified, then clear dao and load
 *  into db before starting server.  Return created express app
 *  (wrapped within a Result).
 *  Types described in knn-ws.d.ts
 */
export default async function serve(knnConfig, dao, data) {
	try {
		const app = express();

		//TODO: squirrel away knnConfig params and dao in app.locals.
		app.locals.k = knnConfig.k;
		app.locals.base = knnConfig.base;
		app.locals.dao = dao;

		if (data) {
			//TODO: load data into dao
			await app.locals.dao.clear();
			for (let entry of data){
				const result = await app.locals.dao.add(entry.features,false, entry.label); 
				if(result.hasErrors) throw result; 
				
			}
		}

		//TODO: get all training results from dao and squirrel away in app.locals
		const features_list = await app.locals.dao.getAllTrainingFeatures();
		if(features_list.hasErrors) throw result;
		app.locals.training = features_list.val;

		//set up routes
		setupRoutes(app);

		return ok(app);
	}
	catch (e) {
		return err(e.toString(), { code: 'INTERNAL' }); 
	}
}


function setupRoutes(app) {
	const base = app.locals.base;
	console.log(`base is ${base}`);
	app.use(cors({exposedHeaders: 'Location'}));
	app.use(express.json({strict: false})); //false to allow string body
	app.use(express.text());
	//uncomment to log requested URLs on server stderr
	app.use(doLogRequest(app));
	//TODO: add knn routes here
	app.post(`${base}/images`,doAddTestImage(app));
	app.get(`${base}/images/:id`,doGetTestImageId(app));
	app.get(`${base}/labels/:id`,doGetLabels(app));

	//must be last
	app.use(do404(app));
	app.use(doErrors(app));
}

//TODO: add real handlers
function doAddTestImage(app){
	return (async function(req,res) {
		try{
			const testFeature = req.body;
			const result = await app.locals.dao.add(testFeature, true);
			if(result.hasErrors) throw result;
			res.json({id : result.val});
		}
		catch(err){
			const mapped = mapResultErrors(err);
			res.status(mapped.status).json(mapped);
		}
	})
}
function doGetTestImageId(app){
	return (async function(req,res) {
		try{
			const result = await app.locals.dao.get(req.params.id,true);
			if(result.hasErrors) throw result;
			const testFeatures = result.val;
			res.json({features : testFeatures.features,label : testFeatures.label});
		}
		catch(err){
			const mapped = mapResultErrors(err);
			res.status(mapped.status).json(mapped);
		}
	})
}

function doGetLabels(app){
	return (async function(req,res) {
		try{
			const trainLabeledFeatures = app.locals.training;
			const testFeaturesResult = await app.locals.dao.get(req.params.id);
			if(testFeaturesResult.hasErrors) throw result;
			const testFeatures =  testFeaturesResult.val;
			const result = knn(testFeatures.features,trainLabeledFeatures,req.query.k);
			if(result.hasErrors) throw result;
			const [label,index] = result.val;
			const id = trainLabeledFeatures[index].id;
			res.json({id, label});
		}
		catch(err){
			const mapped = mapResultErrors(err);
			res.status(mapped.status).json(mapped);
		}
	})
}

/** Handler to log current request URL on stderr and transfer control
 *  to next handler in handler chain.
 */
function doLogRequest(app) {
	return (function(req, res, next) {
		console.error(`${req.method} ${req.originalUrl}`);
		next();
	});
}

/** Default handler for when there is no route for a particular method
 *  and path.
 */
function do404(app) {
	return async function(req, res) {
		const message = `${req.method} not supported for ${req.originalUrl}`;
		const result = {
			status: STATUS.NOT_FOUND,
			errors: [	{ options: { code: 'NOT_FOUND' }, message, }, ],
		};
		res.status(404).json(result);
	};
}


/** Ensures a server error results in nice JSON sent back to client
 *  with details logged on console.
 */ 
function doErrors(app) {
	return async function(err, req, res, next) {
		const message = err.message ?? err.toString();
		const result = {
			status: STATUS.INTERNAL_SERVER_ERROR,
			errors: [ { options: { code: 'INTERNAL' }, message } ],
		};
		res.status(STATUS.INTERNAL_SERVER_ERROR).json(result);
		console.error(result.errors);
	};
}

/*************************** Mapping Errors ****************************/

//map from domain errors to HTTP status codes.  If not mentioned in
//this map, an unknown error will have HTTP status BAD_REQUEST.
const ERROR_MAP = {
	EXISTS: STATUS.CONFLICT,
	NOT_FOUND: STATUS.NOT_FOUND,
	AUTH: STATUS.UNAUTHORIZED,
	DB: STATUS.INTERNAL_SERVER_ERROR,
	INTERNAL: STATUS.INTERNAL_SERVER_ERROR,
}

/** Return first status corresponding to first options.code in
 *  errors, but SERVER_ERROR dominates other statuses.  Returns
 *  BAD_REQUEST if no code found.
 */
function getHttpStatus(errors) {
	let status = null;
	for (const err of errors) {
		const errStatus = ERROR_MAP[err.options?.code];
		if (!status) status = errStatus;
		if (errStatus === STATUS.SERVER_ERROR) status = errStatus;
	}
	return status ?? STATUS.BAD_REQUEST;
}

/** Map domain/internal errors into suitable HTTP errors.  Return'd
 *  object will have a "status" property corresponding to HTTP status
 *  code.
 */
function mapResultErrors(err) {
	if(err instanceof Error) console.log(err);
	const errors = err.errors ?? [ { message: err.message ?? err.toString() } ];
	const status = getHttpStatus(errors);
	if (status === STATUS.INTERNAL_SERVER_ERROR)  console.error(errors);
	return { status, errors, };
} 





