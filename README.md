![YourHonour Banner](server/views/img/yourhonourlogo.png)

A Kubernetes based, extremely easy to deploy programming judge. Right now, everything
is built specific to the IIT Kanpur network connection and the Vyomkesh Openstack cloud
setup for CSE. However, with a few changes, it should work with pretty much any arbitrary
setup of Kubernetes.

Once the functionality is complete, I will work on adding support for easy deployment
on any nodes. If you think you have suggestons, or if you are willing to contribute to
this project, I would be delighted to accept your pull request.

## Steps to setup for the first time:
- Install mongodb
- Create /data/db directory and restart mongodb
- Install GoLang
- `make`
- `cd server` and `npm install`


---

The project is released under a MIT License.

Copyright © 2016 - Pallav Agarwal
