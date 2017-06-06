import * as AWS from 'aws-sdk';
import * as React from 'react';
import GoogleLogin, {GoogleLoginResponse} from 'react-google-login';

interface LoginProps {
  onSuccessfulLogin: () => void
}

interface LoginState {
  errorMessage: string | null
}

export default class extends React.Component<LoginProps, LoginState> {
  constructor() {
    super();
    this.state = { errorMessage: null };
  }

  onSuccessfulGoogleLogin = async (res: GoogleLoginResponse) => {
    AWS.config.credentials = new AWS.WebIdentityCredentials({
      RoleArn: 'arn:aws:iam::762636538502:role/number-switcher-4000',
      RoleSessionName: 'number-switcher-4000-web',
      WebIdentityToken: res.getAuthResponse().id_token
    });
    const sts = new AWS.STS();
    try {
      await sts.getCallerIdentity().promise();
      this.props.onSuccessfulLogin();
    } catch (err) {
      this.setState({ errorMessage: 'Account not permitted access' });
    }
  }

  onFailedGoogleLogin = (err: any) => {
    this.setState({ errorMessage: err });
  }

  render() {
    return (
      <div>
        <GoogleLogin
          clientId="721076834592-7iidl9sk4jfc09npct0c4ip8cnmtuknm.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={this.onSuccessfulGoogleLogin}
          onFailure={this.onFailedGoogleLogin} />
        <p style={{color: 'red'}}>{this.state.errorMessage}</p>
      </div>
    );
  }
}
