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
	const buffer = new ArrayBuffer(16);
	const view = new DataView(buffer);
	for (var k=0; k<16; k++) {
		view.setInt8(k, arraybyte[k]);
	}	
	let j = 0;
	for (const obj of headerspec){
		var header_name =obj.name;
		var header_value = obj.value;
		if (header_value) { 
			if (header_value !== view.getInt32(j))
			{
				return err('BAD_VAL');
			}			
		}
		header[header_name]=view.getInt32(j);
		j=j+4;
	}

	let restArray = arraybyte.slice(16);
	return [header,restArray]
}

function auxilarylabels(headerspec,arraybyte){

        const l_header = {};
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        for (var k=0; k<8; k++) {
                view.setInt8(k, arraybyte[k]);
        }
        let j = 0;
        for (const obj of headerspec){
                var l_header_name =obj.name;
                var l_header_value = obj.value;
                if (l_header_value) {
                        if (l_header_value !== view.getInt32(j))
                        {
                              return err('BAD_VAL');
                        }
                }
               l_header[l_header_name]=view.getInt32(j);
                j=j+4;
        }
        let l_restArray = arraybyte.slice(8);
        return [l_header,l_restArray]
}


export default function parseImages(imageSpecs, imageBytes) {
	
	const [image_headers ,image_rest] = auxilaryimage(imageSpecs.images,imageBytes.images);
	const [labels_headers,labels_rest] = auxilarylabels(imageSpecs.labels,imageBytes.labels);
	
	const totalByte = image_headers.nImages * image_headers.nRows * image_headers.nCols;
	
	const image_restArrayLength = (image_rest).length;
	
	if (totalByte !== image_restArrayLength | image_headers.nImages !== labels_headers.nLabels){
		return err('BAD_FMT');
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

	return ok(result);
}

