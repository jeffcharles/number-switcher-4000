import * as AWS from 'aws-sdk';
import * as React from 'react';
import GoogleLogin, {GoogleLoginResponse} from 'react-google-login';

interface LoginProps {
  onSuccessfulLogin: () => void
}

export default class extends React.Component<LoginProps, {}> {
  onSuccessfulGoogleLogin = (res: GoogleLoginResponse) => {
    AWS.config.credentials = new AWS.WebIdentityCredentials({
      RoleArn: 'arn:aws:iam::762636538502:role/number-switcher-4000',
      RoleSessionName: 'number-switcher-4000-web',
      WebIdentityToken: res.getAuthResponse().id_token
    });
    this.props.onSuccessfulLogin();
  }

  onFailedGoogleLogin = (err: any) => {
    console.error(err);
  }

  render() {
    return (
      <GoogleLogin
        clientId="721076834592-7iidl9sk4jfc09npct0c4ip8cnmtuknm.apps.googleusercontent.com"
        buttonText="Login"
        onSuccess={this.onSuccessfulGoogleLogin}
        onFailure={this.onFailedGoogleLogin} />
    );
  }
}
