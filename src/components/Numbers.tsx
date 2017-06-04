import * as AWS from 'aws-sdk';
import * as React from 'react';

interface numbersState {
  phoneNumbers: { [name: string]: string } | null
}

export default class extends React.Component<{}, numbersState> {
  private s3: AWS.S3;

  constructor() {
    super();
    this.state = { phoneNumbers: null }
  }

  async componentDidMount() {
    this.s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const res = await this.s3.getObject({ Bucket: 'number-switcher-4000', Key: 'phone-numbers.json' }).promise();
    if (!res.Body) {
      throw new Error('No body');
    }
    if (!Buffer.isBuffer(res.Body)) {
      throw new Error('Body is not a buffer');
    }
    const phoneNumbers = JSON.parse(res.Body.toString('utf-8'));
    this.setState({ phoneNumbers })
  }

  onAutoDialIn = async () => {
    await this.updateS3(`<?xml version="1.0" encoding="UTF-8"?><Response><Play digits="6"></Play></Response>`);
  }

  onUpdateNumber = async (number: string) => {
    await this.updateS3(`<?xml version="1.0" encoding="UTF-8"?><Response><Dial>${number}</Dial></Response>`);
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
                <input type="radio" name="number" onClick={() => this.onUpdateNumber(phoneNumbers[name])} />
                {name}: {phoneNumbers[name]}
              </label>
            </li>
          ))}
          <li>
            <label>
              <input type="radio" name="number" onClick={this.onAutoDialIn} />
              Automatically dial in
            </label>
          </li>
        </ul>
      </form>
    );
  }
}
