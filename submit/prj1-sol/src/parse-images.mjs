import { ok, err } from 'cs544-js-utils';

/** parse byte streams in imageBytes: { images: Uint8Array, labels:
 *  Uint8Array } as per imageSpecs { images: HeaderSpec[], labels:
 *  HeaderSpec[] } to return a list of LabeledFeatures (wrapped within
 *  a Result).
 *
 *  Errors:
 *    BAD_VAL: value in byte stream does not match value specified
 *             in spec.
 *    BAD_FMT: size of bytes stream inconsistent with headers
 *             or # of images not equal to # of labels.
 */
 
 
function auxilaryimage(headerspec,arraybyte){
	
	const header = {};
	//const restArray = [];

	const buffer = new ArrayBuffer(16);
	const view = new DataView(buffer);
	for (var k=0; k<16; k++) {
		view.setInt8(k, arraybyte[k]);
	}

//	console.log("Magic Number" + view.getInt32(0));
//	console.log("Magic Number" + view.getInt32(4));
//	console.log("Magic Number" + view.getInt32(8));
//	console.log("Magic Number" + view.getInt32(12));
	
	let j = 0;
	for (const obj of headerspec){
		var header_name =obj.name;
		var header_value = obj.value;
		if (header_value) { 
			if (header_value !== view.getInt32(j))
			{
//				console.log('header_value :',header_value);
//				console.log('int_value :',view.getInt32(j));
				return err('BAD_VAL');
			}			
		}
		header[header_name]=view.getInt32(j);
		j=j+4;
	}
//	console.log(typeof(header));
	let restArray = arraybyte.slice(16);
//	console.log(typeof(restArray));
	return [header,restArray]
}

function auxilarylabels(headerspec,arraybyte){

        const l_header = {};
        //const restArray = [];

        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        for (var k=0; k<8; k++) {
                view.setInt8(k, arraybyte[k]);
        }

//        console.log("Magic Number" + view.getInt32(0));
//        console.log("Magic Number" + view.getInt32(4));

        let j = 0;
        for (const obj of headerspec){
                var l_header_name =obj.name;
                var l_header_value = obj.value;
                if (l_header_value) {
                        if (l_header_value !== view.getInt32(j))
                        {
//                                console.log('header_value :',l_header_value);
  //                              console.log('int_value :',view.getInt32(j));
                                return err('BAD_VAL');
                        }
                }
               l_header[l_header_name]=view.getInt32(j);
                j=j+4;
        }
    //    console.log(typeof(l_header));
        let l_restArray = arraybyte.slice(16);
      // 	console.log(typeof(l_restArray));
        return [l_header,l_restArray]
}


export default function parseImages(imageSpecs, imageBytes) {
	
	var value1 = auxilaryimage(imageSpecs.images,imageBytes.images);
	var value2 = auxilarylabels(imageSpecs.labels,imageBytes.labels);
	var image_headers = value1[0];
	var image_rest = value1[1];
	var labels_headers = value2[0];
        var labels_rest = value2[1];
	var arr =[];
	var totalByte = 1;
	console.log(typeof(image_headers),'image headerspec:',image_headers);
	console.log(typeof(image_rest),'image rest',image_rest);
	console.log(typeof(labels_headers),'label headersspec:',labels_headers);
        console.log(typeof(labels_rest),'label rest',labels_rest);
	for(var key of Object.keys(image_headers)){
		arr.push(image_headers[key]);
//		console.log(arr);
	}
	console.log(arr);
	for(let a=1; a < arr.length;a++){
		totalByte *= arr[a];
	}
	console.log(totalByte);
	//console.log('length',Object.keys(image_rest).length);
	var image_restArrayLength = (image_rest).length;
	console.log(image_restArrayLength);
	if (totalByte !== image_restArrayLength | image_headers.nImages !== labels_headers.nLabels){
		return err('BAD_FMT')
	}

	var result = [];

	for (let l=0; l<labels_rest.length; l++) {
		var labeled_features = {};
		// add key : label value : actual value of label 
		labeled_features.label = labels_rest[l];
		var x = (l)*image_headers.nRows*image_headers.nCols;
		var y = (l+1)*image_headers.nRows*image_headers.nCols;
		// add key : features vvalue : actual value of features 
		labeled_features.features = image_rest.slice(x, y);
		result.push(labeled_features);
	}

	console.log("result: ", result);

//	var imageArray = [];
//	var labelArray = [];
//	for (let x=0;x<image_restArrayLength; x += image_headers.nRows*image_headers.nCols){
//		console.log(image_rest.slice(0,784));
//		let y = x +image_headers.nRows*image_headers.nCols;
	//	console.log('image: ', image_rest.slice(x,y));
//		imageArray.push(image_rest.slice(x,y));
//	}
//	console.log(Object.keys(labels_rest));
//	for (let x=0;x < (labels_rest).length;x++) {
//		labelArray.push(labels_rest[x]);
//	}
//	console.log(labelArray.length + '--'+ imageArray.length);
//	var labeledFeature = {};
//	imageArray.forEach((key,i)=> labeledFeature[key]=labelArray[i]);
//	console.log(labeledFeature);

	return ok(result);
}

