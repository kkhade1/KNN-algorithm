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
	for (const spec_obj of headerspec){
		let spec_header_name = spec_obj.name;
		let spec_header_value = spec_obj.value;
		let image_header_value = view.getInt32(j);
		
		if (spec_header_value) { 
			if (spec_header_value !== image_header_value)
			{
				return err(`BAD_VAL found. For image header ${spec_header_name}, spec value ${spec_header_value} does not match image value ${image_header_value}.`, {code: 'BAD_VAL'});
			}			
		}
		header[spec_header_name]=image_header_value;
		j=j+4;
	}

	let restArray = arraybyte.slice(16);
	return ok([header,restArray]);
}

function auxilarylabels(headerspec,arraybyte){

        const label_header = {};
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        for (var k=0; k<8; k++) {
                view.setInt8(k, arraybyte[k]);
        }
        let j = 0;
        for (const spec_obj of headerspec){
                let spec_label_header_name = spec_obj.name;
		let spec_label_header_value = spec_obj.value;
		let label_header_value = view.getInt32(j);
		
                if (spec_label_header_value) {
                        if (spec_label_header_value !== label_header_value)
                        {
                        	
                              return err(`BAD_VAL found. For label header ${spec_label_header_name}, spec header ${spec_label_header_value} does not match label header ${label_header_value}.`, {code: 'BAD_VAL'});
                        }
                }
               label_header[spec_label_header_name] = label_header_value;
                j=j+4;
        }
        let label_restArray = arraybyte.slice(8);
        return ok([label_header,label_restArray]);
}


export default function parseImages(imageSpecs, imageBytes) {
	const auxilary_image_result = auxilaryimage(imageSpecs.images,imageBytes.images);
	if (auxilary_image_result.hasErrors) {
	 return auxilary_image_result;
	 }
	 
	const [image_headers ,image_rest] = auxilary_image_result.val;
	
	const auxilary_label_result = auxilarylabels(imageSpecs.labels,imageBytes.labels);
	if (auxilary_label_result.hasErrors) return auxilary_label_result
	const [labels_headers,labels_rest] = auxilary_label_result.val;
	
	// Detect inconstent length in images
	const image_total_byte = image_headers.nImages * image_headers.nRows * image_headers.nCols;
	if (image_total_byte !== image_rest.length) {
		return err(`BAD_FMT found. Number of total bytes ${image_total_byte} given in image header spec not equal to image rest array length ${image_rest.length}. `, {code: 'BAD_FMT'});
	
	}
	// Detect inconstent length in labels
	const label_total_byte = labels_headers.nLabels;
	if (label_total_byte !== labels_rest.length) {
		return err(`BAD_FMT found. Number of total bytes ${label_total_byte} given in label header spec not equal to label rest array length ${labels_rest.length}. `, {code: 'BAD_FMT'});
	
	}
	
	//Detect inconstency between # of labels and # of images
	if(image_headers.nImages !== labels_headers.nLabels){
		return err(`BAD_FMT found. Number of total images given in header spec ${image_headers.nImages} does not match number of labels in label header spec ${labels_headers.nLabels} `, {code: 'BAD_FMT'});
	}

	var result = [];

	for (let l=0; l<labels_rest.length; l++) {
		var labeled_features = {};
		// add key : label value : actual value of label 
		labeled_features.label = labels_rest[l].toString();
		var x = (l)*image_headers.nRows*image_headers.nCols;
		var y = (l+1)*image_headers.nRows*image_headers.nCols;
		// add key : features vvalue : actual value of features 
		labeled_features.features = image_rest.slice(x, y);
		result.push(labeled_features);
	}

	return ok(result);
}

