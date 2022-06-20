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
	for const train of trainLabeledFeatures{
		var distance = calculate_distance(train.features, testFeatures);
		distLabelIndexes.push(
			{
				dist : distance,
				index : ind,
				label : train.labels
			}
		);
		ind++;
	}

	// Sort distLabelIndexes Array by distance
	var sorted_distLabelIndexes = [];
	sorted_distLabelIndexes= distLabelIndexes.sort((a,b)=>a.dist-b.dist);

	//Get k smallest entries from sorted_distLabelIndexes
	var k_smallest_entries = sorted_distLabelIndexes.slice(0,k);

	//get Label and Index of maxoccurence of distance in result array
	var result = get_maxOccurance_image(k_smallest_entries);
	return result;
}
// trainfeatures = byte array 
// testfeatures = byte array
// return distance between trainfeatures and testfeatures
function calculate_distance(trainfeatures,testfeatures){
	var sum = 0;
	for(let i=0; i< trainfeatures.length;i++){
		sum += Math.pow((parseInt(trainfeatures[i],2) - parseInt(testfeatures[i],2)),2);
	}
	return sum;	
}
function get_maxOccurance_image(k_entries){
	var maxcount = 0;
	var maxLabel = 0;
	var maxIndex = 0;
	var maxdist = 0;
	var dict ={};
	for (var e of k_entries){
		if e.dist in dict{
			dict[e.dist] = dict[e.dist]+1;
		}
		else{
			dict[e.dist] = 1;
		}
		if dict[e.dist]>maxcount{
			maxcount = dict[e.dist];
			maxdist = e.dist;
			maxLabel = e.label;
			maxIndex = e.index;
		}
	}
	return [maxLabel,maxIndex];

}

