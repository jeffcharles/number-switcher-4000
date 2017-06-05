import * as AWS from 'aws-sdk';
import * as React from 'react';
import * as xml2js from 'xml2js';

interface numbersState {
  phoneNumbers: { [name: string]: string } | null
  activeNumber: string | null
}

export default class extends React.Component<{}, numbersState> {
  private s3: AWS.S3;

  constructor() {
    super();
    this.state = { phoneNumbers: null, activeNumber: null }
  }

  async componentDidMount() {
    this.s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const [phoneNumbersRes, numbersRes] = await Promise.all([
      this.s3.getObject({ Bucket: 'number-switcher-4000', Key: 'phone-numbers.json' }).promise(),
      this.s3.getObject({ Bucket: 'number-switcher-4000', Key: 'number.xml' }).promise()
    ]);

    if (!phoneNumbersRes.Body) {
      throw new Error('No body');
    }
    if (!Buffer.isBuffer(phoneNumbersRes.Body)) {
      throw new Error('Body is not a buffer');
    }
    const phoneNumbers = JSON.parse(phoneNumbersRes.Body.toString('utf-8'));
    this.setState({ phoneNumbers })

    if (!numbersRes.Body) {
      throw new Error('No numbers body');
    }
    if (!Buffer.isBuffer(numbersRes.Body)) {
      throw new Error('Number body is not a buffer');
    }
    const numbersBody: Buffer = numbersRes.Body;
    const currentNumberXml: any = await new Promise((resolve, reject) => {
      xml2js.parseString(numbersBody, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
    const currentNumer = currentNumberXml.Response && (currentNumberXml.Response.Dial && currentNumberXml.Response.Dial[0]) || (currentNumberXml.Response.Play && 'auto-dial-in');
    this.setState({ activeNumber: currentNumer });
  }

  onAutoDialIn = async () => {
    await this.updateS3(`<?xml version="1.0" encoding="UTF-8"?><Response><Play digits="6"></Play></Response>`);
    this.setState({ activeNumber: 'auto-dial-in' });
  }

  onUpdateNumber = async (number: string) => {
    await this.updateS3(`<?xml version="1.0" encoding="UTF-8"?><Response><Dial>${number}</Dial></Response>`);
    this.setState({ activeNumber: number });
  }

  async updateS3(body: string) {
    return await this.s3.putObject({
      Bucket: 'number-switcher-4000',
      Key: 'number.xml',
      Body: body,
      ContentType: 'application/xml'
    }).promise();
  }

  render() {
    if (!this.state.phoneNumbers) {
      return <p>Loading...</p>;
    }
    const phoneNumbers = this.state.phoneNumbers;
    return (
      <form>
        <p>Pick a number:</p>
        <ul>
          {Object.keys(phoneNumbers).map(name => (
            <li key={name}>
              <label>
                <input type="radio" name="number" checked={this.state.activeNumber === phoneNumbers[name]} onClick={() => this.onUpdateNumber(phoneNumbers[name])} />
                {name}: {phoneNumbers[name]}
              </label>
            </li>
          ))}
          <li>
            <label>
              <input type="radio" name="number" checked={this.state.activeNumber === 'auto-dial-in'} onClick={this.onAutoDialIn} />
              Automatically dial in
            </label>
          </li>
        </ul>
      </form>
    );
  }
}
