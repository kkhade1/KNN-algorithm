import { ok, err } from 'cs544-js-utils';

export default function makeKnnWsClient(wsUrl) {
  return new KnnWsClient(wsUrl);
}

class KnnWsClient {
  constructor(wsUrl) {
    console.log("knn ws  client");
    this.url = wsUrl;
  }
  
  /** Given a base64 encoding b64Img of an MNIST compatible test
   *  image, use web services to return a Result containing at least
   *  the following properties:
   *
   *   `label`: the classification of the image.
   *   `id`: the ID of the training image "closest" to the test
   *         image.
   * 
   *  If an error is encountered then return an appropriate
   *  error Result.
   */
  async classify(b64Img) {
    try{
  	const addImageResponse = await fetch(this.url+"/knn/images", {
      	   method: 'POST',
           headers: {
              'Content-Type': 'application/json',
           },
           body: JSON.stringify(b64Img)
    	})
    	const data = await addImageResponse.json();
    	const id = data.id;
  	const labelResponse = await fetch(this.url+'/knn/labels/'+id);
  	const result = await labelResponse.json();
  	return result;
      }
      catch(error){
        const errorObj = {
        	"message": error.message,
        	"options" : { 
        		"code": "NETWORK_ERROR"
        	}
        };
        return this.wsError({"errors":[errorObj]});
      }
  }

  /** Return a Result containing the base-64 representation of
   *  the image specified by imageId.  Specifically, the success
   *  return should be an object containing at least the following
   *  properties:
   *
   *   `features`:
   *     A base-64 representation of the retrieved image bytes.
   *   `label`:
   *     The label associated with the image (if any).
   *
   *  If an error is encountered then return an appropriate
   *  error Result.
   */
  async getImage(imageId) {
    const imageResponce = await fetch(this.url+'/knn/images/'+imageId);
    const image = await imageResponce.json();
  }

  /** convert an erroneous JSON web service response to an error Result. */
  wsError(jsonRes) {
    return err(jsonRes.errors[0].message, jsonRes.errors[0].options);
    
  }

}

