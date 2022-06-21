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
export default function  knn(testFeatures, trainLabeledFeatures, k=3) {
	var distLabelIndexes =[];
	var ind = 0;

	// For each training image, calculate distance between test and train
	// output: Array of
	// {
	// 	dist: ,
	// 	index: ,
	// 	label: 
	// }
	for (var train of trainLabeledFeatures){
		// check length of train feature and tesrFeature 
		if (train.features.length !== testFeatures.length) {
			return err(`BAD_FMT found. Train features length ${train.features.length} does not match test features length ${testFeatures.length}.`, {code: 'BAD_FMT'});
		}
		var distance = calculate_distance(train.features, testFeatures);
		
		distLabelIndexes.push(
			{
				dist : distance,
				index : ind,
				label : train.label
			}
		);
		ind++;
	}
	
	// Sort distLabelIndexes Array by distance
	var sorted_distLabelIndexes = [];
	sorted_distLabelIndexes= distLabelIndexes.sort((a,b)=>a.dist-b.dist);
	console.log('sorted array :',sorted_distLabelIndexes.slice(0,k));
	//Get k smallest entries from sorted_distLabelIndexes
	var result = get_maxOccurance_image(sorted_distLabelIndexes.slice(0,k));
	return ok(result);
}
// trainfeatures = byte array 
// testfeatures = byte array
// return distance between trainfeatures and testfeatures
function calculate_distance(trainfeatures,testfeatures) {
	const buffer = new ArrayBuffer(2);
	const view = new DataView(buffer);
	var sum = 0;
	
	for(let i=0; i< trainfeatures.length; i++) {
		view.setInt8(0, trainfeatures[i]);
		view.setInt8(1, testfeatures[i]);
		
		sum += Math.pow((view.getInt8(0) - view.getInt8(1)),2);
	}
	
	return sum;	
}
function get_maxOccurance_image(k_entries){
	var maxcount = 0;
	var maxLabel = 0;
	var maxIndex = 0;
	var dict ={};
	
	for (const entry of k_entries){
		
		if (Object.keys(dict).includes(entry.label)) {
			dict[entry.label] = dict[entry.label]+1;
		}
		else{
			dict[entry.label] = 1;
		}
		
		if ((dict[entry.label]) > maxcount){
			maxcount = dict[entry.label];
			maxLabel = entry.label;
			maxIndex = entry.index;
		}
	}
	
	return [maxLabel,maxIndex];

}

