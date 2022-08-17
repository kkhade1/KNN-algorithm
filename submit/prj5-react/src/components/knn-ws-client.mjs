import { ok, err } from 'cs544-js-utils';

export default function makeKnnWsClient(wsUrl) {
  return new KnnWsClient(wsUrl);
}

class KnnWsClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.imagesUrl = `${wsUrl}/knn/images`;
    this.labelsUrl = `${wsUrl}/knn/labels`;
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
    try {
      const postUrl = this.imagesUrl;
      const postRes = await fetch(postUrl, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json', },
	mode: 'cors',
	body: JSON.stringify(b64Img),
      });
      const postJson = await postRes.json();
      if (postJson.errors) return this.wsError(postJson);	
      const testId = postJson.id;
      const labelUrl = `${this.labelsUrl}/${testId}`;
      const getRes = await fetch(labelUrl);
      const getJson = await getRes.json();
      if (getJson.errors) return this.wsError(getJson);
      return ok(getJson);
    }
    catch (e) {
      if (e instanceof Error) console.error(e);
      return err(e.message ?? e.toString());
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
    try {
      const getUrl = `${this.imagesUrl}/${imageId}`;
      const getRes = await fetch(getUrl);
      const getJson = await getRes.json();
      if (getJson.errors) return this.wsError(getJson);
      return ok(getJson);
    }
    catch (e) {
      if (e instanceof Error) console.error(e);
      return err(e.message ?? e.toString());
    }
  }

  /** convert an erroneous JSON web service response to an error Result. */
  wsError(jsonRes) {
    return err(jsonRes.errors[0].message, jsonRes.errors[0].options);
  }

}

