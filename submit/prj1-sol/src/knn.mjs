import { ok, err } from 'cs544-js-utils';

/** return pair [label, index] (wrapped within a Result) of the
 *  training LabeledFeatures trainLabeledFeatures having the most
 *  common label of the k training features closest to subject
 *  testFeatures.
 *
 *  Errors:
 *    BAD_FMT: trainLabeledFeatures has features bytes with length 
 *             different from length of subject testFeatures.
 */
export default function  knn(testFeatures, trainLabeledFeatures, k=3){
	var distLabelIndexes =[];
	var ind = 0

	// For each training image, calculate distance between test and train
	// output: Array of
	// {
	// 	dist: ,
	// 	index: ,
	// 	label: 
	// }
	for (var train of trainLabeledFeatures){
		// check length of train feature and tesrFeature 
		//console.log('train:',train);
		//console.log('trainFeature length :',train.features.length);
		//console.log('testfeature lenght :', testFeatures.length);
		if (train.features.length !== testFeatures.length) {
			return err('BAD_FMT');
		}
		var distance = calculate_distance(train.features, testFeatures);
		//console.log('dist',distance);
		distLabelIndexes.push(
			{
				dist : distance,
				index : ind,
				label : train.label
			}
		);
		ind++;
	}
	console.log('distLabelIndex : ',distLabelIndexes.slice(0,5));
	// Sort distLabelIndexes Array by distance
	var sorted_distLabelIndexes = [];
	sorted_distLabelIndexes= distLabelIndexes.sort((a,b)=>a.dist-b.dist);
	console.log('sorted array :',sorted_distLabelIndexes.slice(0,5));
	//Get k smallest entries from sorted_distLabelIndexes
	var k_smallest_entries = sorted_distLabelIndexes.slice(0,k);

	console.log('K entries',k_smallest_entries);
	//get Label and Index of maxoccurence of distance in result array
	var result = get_maxOccurance_image(k_smallest_entries);
	console.log('result: ', result);
	return ok(result);
}
// trainfeatures = byte array 
// testfeatures = byte array
// return distance between trainfeatures and testfeatures
function calculate_distance(trainfeatures,testfeatures){
	const buffer = new ArrayBuffer(2);
	const view = new DataView(buffer);
	var sum = 0;
	
	for(let i=0; i< trainfeatures.length;i++){
		view.setInt8(0, trainfeatures[i]);
		view.setInt8(1, testfeatures[i]);
		
		//console.log('subtract: ', view.getInt8(0) - view.getInt8(1));
		sum += Math.pow(view.getInt8(0) - view.getInt8(1),2);
	}
	//console.log('sum: ', sum);
	return sum;	
}
function get_maxOccurance_image(k_entries){
	var maxcount = 0;
	var maxLabel = 0;
	var maxIndex = 0;
	var maxdist = 0;
	var dict ={};
	//console.log(k_entries);
	for (let entry of k_entries){
		console.log('dist: ', entry.dist);
		
		if (Object.keys(dict).includes(entry.dist)){
			dict[entry.dist] = dict[entry.dist]+1;
		}
		else{
			dict[entry.dist] = 1;
		}
		
		if ((dict[entry.dist]) > maxcount){
			maxcount = dict[entry.dist];
			maxdist = entry.dist;
			maxLabel = entry.label;
			maxIndex = entry.index;
		}
	}
	return [maxLabel,maxIndex];

}

