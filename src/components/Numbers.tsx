import * as AWS from 'aws-sdk';
import * as React from 'react';
import * as xml2js from 'xml2js';
import { RadioGroup, RadioButton } from 'react-toolbox/lib/radio';

interface numbersState {
  phoneNumbers: { [name: string]: string } | null
  activeNumber: string | null,
  updateStatus: string | null
}

export default class extends React.Component<{}, numbersState> {
  private s3: AWS.S3;

  constructor() {
    super();
    this.state = { phoneNumbers: null, activeNumber: null, updateStatus: null }
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

  onNumberChange = async (number: string) => {
    this.setState({
      activeNumber: number,
      updateStatus: 'Updating...'
    });
    const body = number === 'auto-dial-in' ?
      `<?xml version="1.0" encoding="UTF-8"?><Response><Play digits="6"></Play></Response>` :
      `<?xml version="1.0" encoding="UTF-8"?><Response><Dial>${number}</Dial></Response>`;
    try {
      await this.s3.putObject({
        Bucket: 'number-switcher-4000',
        Key: 'number.xml',
        Body: body,
        ContentType: 'application/xml'
      }).promise();
      this.setState({ updateStatus: 'Updated' });
    } catch (err) {
      this.setState({ updateStatus: `Error updating number: ${err}` });
    }
  }

  render() {
    if (!this.state.phoneNumbers) {
      return <p>Loading...</p>;
    }
    const phoneNumbers = this.state.phoneNumbers;
    return (
      <div>
        <RadioGroup name="number" value={this.state.activeNumber} onChange={this.onNumberChange}>
          {Object.keys(phoneNumbers).map(name => (
            <RadioButton key={name} label={`${name}: ${phoneNumbers[name]}`} value={phoneNumbers[name]} />
          ))}
          <RadioButton label="Automatically dial in" value="auto-dial-in" />
        </RadioGroup>
        <p style={{fontStyle: 'italic' }}>{this.state.updateStatus}</p>
      </div>
    );
  }
}
