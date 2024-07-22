terraform {
  backend "s3" {
    bucket         = "924511948270-state"
    key            = "state/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "924511948270-state"
  }
}