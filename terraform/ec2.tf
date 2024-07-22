resource "aws_security_group" "ldap_server_sg" {
  name        = "ldap-server-sg"
  description = "Allow LDAP and SSH traffic to EC2 instances"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 389
    to_port     = 389
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 636
    to_port     = 636
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "LDAP Server SG"
  }
}

resource "tls_private_key" "ldap_private_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "ldap_server_key" {
  key_name   = "ldap-server-key"
  public_key = tls_private_key.ldap_private_key.public_key_openssh
}

output "private_key_pem" {
  value     = tls_private_key.ldap_private_key.private_key_pem
  sensitive = true
}

resource "aws_instance" "ldap_server" {
  ami           = "ami-0b995c42184e99f98"
  instance_type = "t2.micro"
  key_name      = aws_key_pair.ldap_server_key.key_name

  vpc_security_group_ids = [aws_security_group.ldap_server_sg.id]
  subnet_id              = module.vpc.public_subnets[0]

  tags = {
    Name = "LDAP Server"
  }
}

resource "aws_eip" "ldap_server_public_eip" {
    instance = aws_instance.ldap_server.id
    domain   = "vpc"
}

resource "aws_lb_target_group" "ldap_tg" {
  name     = "ldap-tg"
  port     = 389
  protocol = "TCP"
  vpc_id   = module.vpc.vpc_id

  health_check {
    port     = "389"
    protocol = "TCP"
  }

  tags = {
    Name = "ldap-tg"
  }
}