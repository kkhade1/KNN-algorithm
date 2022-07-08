import { MongoClient } from 'mongodb';

import { ok, err } from 'cs544-js-utils';

import { b64ToUint8Array, uint8ArrayToB64 } from './uint8array-b64.mjs';

export default async function makeFeaturesDao(dbUrl) {
	return FeaturesDao.make(dbUrl);
}

class FeaturesDao {
	constructor (params){ Object.assign(this,params); }	

	static async make(dburl){
		const params ={};
		try{
			params._client = await (new MongoClient(dburl)).connect();
			const db = params._client.db();
			const features_collection = db.collection('features_collection');
			params.features_collection = features_collection;
			await features_collection.createIndex('FeatureId');
			params.count = await features_collection.countDocuments();
			return ok(new FeaturesDao(params));
		}
		catch(error){
			return err(error.message,{code:'DB'});
		}
	}

	async close(){
		try {
			await this._client.close();
		}
		catch(e){
			err(e.message,{code:'DB'});
		}

	}

	async add(features,isB64,label=null){
		try{
			const Id = await this.#nextFeatureId();
			
			if (!isB64){
				features = uint8ArrayToB64(features);
			}
			const dbObj = {_id:Id,features, label};
			const collection = this.features_collection;
			const insertResult = await collection.insertOne(dbObj);
			const insertedfeature_id = insertResult.insertedId;
			if(insertedfeature_id !== Id){
				return err(`Expected inserted id ${insertedfeature_id} not equal to ${Id}`,{code : 'DB'});
			}

			return ok(Id)   
		}
		catch(e){
			return err(e.message,{code :'DB'});
		}  

	}

	async get(id,isB64=false){
		try{
			const collection = this.features_collection;
			const feature_dbEntry = await collection.findOne({_id:id});
			
			if(feature_dbEntry){
				delete feature_dbEntry._id;
				if (!isB64){
					feature_dbEntry.features = b64ToUint8Array(feature_dbEntry.features);
				}
				
				return ok(feature_dbEntry);
			}
			else{
				return err(`No feature found for id ${id}`,{code :'NOT_FOUND'});
			}
		}	
		catch(e){
			return err(e.message,{code :'DB'});
		}	
	}

	async clear(){
		try{
			await this.features_collection.deleteMany({});
			return ok();
		}
		catch(e){
			return err(e.message,{code :'DB'});
		}
	}

	async getAllTrainingFeatures(){
		try{
			const collection = this.features_collection;
			const cursor = await collection.find({label:{$ne : null}});
			const trainingFeatures_entries = await cursor.toArray();
			const trainingFeatures = trainingFeatures_entries.
				map(entry => {
					entry.features = b64ToUint8Array(entry.features)
					delete entry._id;
					return entry});
			return ok(trainingFeatures);
		}
		catch(e){
			return err(e.message,{code :'DB'});
		}
	}

	async #nextFeatureId(){
		const query = {_id : NEXT_ID};
		const update = {$inc :{[NEXT_ID]:1}};
		const option = {upsert:true, returnDocument : 'after'};
		const ret = await this.features_collection.findOneAndUpdate(query, update, option);
		const seq = ret.value[NEXT_ID];
		return String(seq)+Math.random().toFixed(2).replace(/^0\./, '_');
	}
}
const NEXT_ID = 'count';

