resource "aws_security_group" "ldap_nlb_sg" {
  name        = "ldap-nlb-sg"
  description = "Allow LDAP and LDAPS traffic"
  vpc_id      = module.vpc.vpc_id

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
    Name = "LDAP Server NLB SG"
  }
}

resource "aws_lb" "nlb" {
  name               = "ldap-nlb"
  internal           = false
  load_balancer_type = "network"
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = false

  tags = {
    Name = "LDAP NLB"
  }
}

resource "aws_lb_listener" "ldap" {
  load_balancer_arn = aws_lb.nlb.arn
  port              = "389"
  protocol          = "TCP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.ldap_tg.arn
  }
}

resource "aws_lb_listener" "ldaps" {
  load_balancer_arn = aws_lb.nlb.arn
  port              = "636"
  protocol          = "TCP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.ldap_tg.arn
  }
}

resource "aws_lb_target_group_attachment" "ldap_server" {
  target_group_arn = aws_lb_target_group.ldap_tg.arn
  target_id        = aws_instance.ldap_server.id
  port             = 389
}
