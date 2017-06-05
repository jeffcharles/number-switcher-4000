# number-switcher-4000

A project for setting up number forwarding for a condo buzzer

## Running the site

- `yarn install`
- `yarn run build` to write the site into the `dist` directory
- upload the contents of `dist` directory to S3 and consider putting CloudFront in front of it
- setup Oauth client credentials in the Google Developer Console
- setup an IAM role to allow logins with Web Identity Federation through Google and lock it down to the email addresses you want to access it
- create an S3 bucket for storing the phone numbers
- Create a phone number in Twilio and use the presigned S3 url for the `numbers.xml` document in the S3 bucket you created in the previous step as the webhook for incoming calls

## Sample phone number document

```json
{
  "Person 1": "111-111-1111",
  "Person 2": "222-222-2222"
}
```

## Sample IAM policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<bucket>/phone-numbers.json"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::<bucket>/number.xml"
        }
    ]
}
```

## Sample IAM trust relationship

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "accounts.google.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "accounts.google.com:aud": "<google app audience>"
        },
        "ForAnyValue:StringEquals": {
          "accounts.google.com:email": [
            "email1@gmail.com",
            "email2@gmail.com"
          ]
        }
      }
    }
  ]
}
```
