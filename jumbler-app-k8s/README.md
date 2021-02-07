# React App (Typescript) Run on Kubernetes

This repo directory contains the config files needed to run the React app located at [../jumbler-app-ts](https://github.com/mglavitsch/jumbler-react/tree/master/jumbler-app-ts) using Docker and Kubernetes.

In this README, you will find a tutorial that shows how to:
1. Use Docker in a development environment
2. Create a production grade Docker image for a React application using NGINX
3. Set up a private Docker registry secured by basic authentication and TLS
4. Set up a Kubernetes cluster using minikube
5. Deploy Kubernetes objects

The code was tested on:
- macOS Mojave 10.14.6
- [Docker Desktop v2.0.0.2](https://www.docker.com/products/docker-desktop)
- Hypervisor [VirtualBox v6.1.6](https://virtualbox.org)
- [minikube v1.10.1](https://minikube.sigs.k8s.io/docs/start) using Kubernetes v1.18.2
- [kubectl v1.18.2](https://kubernetes.io/docs/tasks/tools/install-kubectl) matching the used Kubernetes version

See installation instructions at the bottom of this page.

# Docker in Development Environment

For this web appliction, [Create React App](https://create-react-app.dev/docs/adding-typescript) with the below stated command was used to get a boilerplate and all the necessary dependencies to start the web application development. This command was run in the root directory of this repository.

```
$ npx create-react-app jumbler-app-ts-cra --template typescript
```

Running `npm start` starts the development server with hot reloading working. After having copied over the React app code from [../jumbler-app-ts/src](https://github.com/mglavitsch/jumbler-react/tree/master/jumbler-app-ts/src), we will set up a development environment supporting hot reloading with the web application code on the host machine and the runtime environment in the Docker container. We distinguish two different Dockerfiles, one for development purposes called `Dockerfile.dev` and the default one called `Dockerfile` which we will later on use to build the production grade Docker image using NGINX.

In order to reflect what we head for in this part of this GitHub repository - which is a running Kubernetes environment - the project directory `jumbler-app-ts-cra` was renamed to `jumbler-app-k8s`.

Build the Docker image `<name>/jumblerdev` and start the container:

```
$ cd jumbler-app-k8s
$ docker build -t <name>/jumblerdev -f Dockerfile.dev .
$ docker run -it --rm -v $(pwd):/usr/app -v /usr/app/node_modules -p 3001:3000 <name>/jumblerdev
```

`<name>` can be a username, i.e. your username on Docker Hub, or the name of an organizational unit.

Open your browser and call [http://localhost:3001](http://localhost:3001).

# Production Grade Docker Image Using NGINX

According to the [Create React App](https://create-react-app.dev/docs/deployment) documentation, `npm run build` creates a build directory with a production build of our app. The [nginx](https://hub.docker.com/_/nginx) documentation explains how to host some simple static content. So we will copy the content of our build directory to directory `/usr/share/nginx/html` of the NGINX image as can be seen in the `Dockerfile`.

Build the Docker image `<name>/jumbler` and start the container:

```
$ cd jumbler-app-k8s
$ docker build -t <name>/jumbler .
$ docker run --rm -p 8081:80 <name>/jumbler
```

You will see the output of NGINX sent to stdout. If you like to start your Docker container in the background, use the detach flag:

```
$ docker run --rm --detach -p 8081:80 <name>/jumbler
```

Open your browser and call [http://localhost:8081](http://localhost:8081).

This production grade setup based on NGINX does not provide hot reloading.

# Setting up a Private Docker Registry

A Kubernetes environment requires a Docker registry to pull an image from. For this purpose, we will set up a private Docker registry within our local Docker Desktop environment and follow the [instructions](https://docs.docker.com/registry/deploying) of the official Docker documentation. We will direct the registry to use both basic authentication and a TLS certificate.

[Docker Hub](https://hub.docker.com) provides a [Docker registry image](https://hub.docker.com/_/registry) which can be used out of the box. We will use the one with tag `2.6.2` as it is the latest one offering the `htpasswd` binary needed to create the basic authentication credentials for our private Docker registry. Unfortunately, the latest image tagged unter the names `2`, `2.7`, `2.7.1` and `latest` does not contain the `htpasswd` binary. Let's examine if the image with tag `2.6.2` contains it.

```
$ docker run --rm --detach registry:2.6.2
<CONTAINER ID>
$ docker exec -it <CONTAINER ID> /bin/sh
/ # which htpasswd
/usr/bin/htpasswd
/ # exit
$ docker stop <CONTAINER ID>
```

Create the credentials using the `htpasswd` binary of the image and store them locally. We will store the credentials in the local directory `$HOME/auth`.

```
$ cd $HOME
$ mkdir -p auth
$ docker run --entrypoint htpasswd registry:2.6.2 -Bbn <username> <password> > $HOME/auth/htpasswd
```

Create a self-signed TLS certificate using [OpenSSL](https://www.openssl.org), where
- `regauth.key` is the private-public key pair,
- `server.csr` is the certificate request,
- `extfile.cnf` is the file containing two subject alternative names; and
- `regauth.crt` is the self-signed certificate.

NOTE: Self-signed certificates are insecure and should only be used for testing purposes. In a production grade setup of a private Docker registry, we need to have our certificate signed by a certificate authority (CA). 

We will set the common name (CN) of the certificate to `localhost` and add to the certificate an IP address as well as an additional FQDN as subject alternative names (SAN). We will need the subject alternative name(s) later on when we pull an image from the private Docker registry from inside the Kubernetes cluster. We will store the two subject alternative names in the file called `extfile.cnf`.

Create the self-signed certificate by generating a certificate request and adding the subject alternative names while converting the certificate request into a self-signed certificate. We will store the certificate related files in the local directory `$HOME/certs`.

```
$ cd $HOME
$ mkdir -p certs
$ cd certs
$ openssl genrsa -out regauth.key
$ openssl req -new -key regauth.key -out server.csr
$ echo "subjectAltName=IP:192.168.99.1,DNS:host.minikube.internal" > extfile.cnf
$ openssl x509 -req -in server.csr -extfile extfile.cnf -signkey regauth.key -out regauth.crt
```

We can inspect the certificate with command:

```
$ openssl x509 -in $HOME/certs/regauth.crt -text
```

Start the registry:

```
$ cd $HOME
$ docker run --detach \
--name registry \
--restart=always \
-p 5021:5000 \
-v "$(pwd)"/auth:/auth \
-v "$(pwd)"/certs:/certs \
-e REGISTRY_AUTH=htpasswd \
-e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
-e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
-e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/regauth.crt \
-e REGISTRY_HTTP_TLS_KEY=/certs/regauth.key \
registry:2.6.2
```

Log in to your private Docker registry, push an image to the registry, remove the image from the local Docker image cache, and pull the image from the registry: 

```
$ docker login localhost:5021
$ docker push localhost:5021/<name>/jumbler
$ docker images localhost:5021/<name>/jumbler
REPOSITORY                      TAG         IMAGE ID       CREATED           SIZE
localhost:5021/<name>/jumbler   latest      <IMAGE ID>     <N> hours ago     134MB
$ docker rmi <IMAGE ID>
<IMAGE ID>
$ docker images localhost:5021/<name>/jumbler
REPOSITORY                      TAG         IMAGE ID       CREATED           SIZE
$ docker pull localhost:5021/<name>/jumbler
REPOSITORY                      TAG         IMAGE ID       CREATED           SIZE
localhost:5021/<name>/jumbler   latest      <IMAGE ID>     <N> hours ago     134MB
```

The [docker registry commands](https://docs.docker.com/engine/reference/commandline/registry) described in the offical Docker documentation are only avaliable in the Docker Enterprise Edition. However, in order to get a list of repositories of our private Docker registry, we will use the [Docker Registry HTTP API V2](https://docs.docker.com/registry/spec/api) and call the API using `curl`: 

```
$ curl -k -u <username>:<password> https://localhost:5021/v2/_catalog
{"repositories":["<name>/jumbler"]}
```

NOTE: We need to apply the `-k` or `--insecure` option of the `curl` command as it allows to skip the validation of our self-signed certificate which would fail if we made the `curl` call without this option. While the transferred content is still encrypted, it is exposed to man-in-the-middle attacks, which can be ignored in our test setup. In a production grade setup, TLS certificates should be signed by a CA.

# Setting up a Kubernetes Cluster using Minikube

## Create a Secret of Type `docker-registry` Based on Existing Docker Credentials

This section explains how to create the Secret to be used by our Kubernetes cluster to access the private Docker registry. The instructions are based on the [official Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

If the OS-keychain-based storing of Docker credentials is deactivated, then the existing Docker credentials will be stored in file `$HOME/.docker/config.json`. Once we logged in to our private Docker registry, a stripped down version of the file `config.json` would look similar to this:

```
{
  "auths" : {
    "localhost:5021" : {
      "auth" : "hnbd...ei4j"
    }
  },
  "HttpHeaders" : {
    "User-Agent" : "Docker-Client/18.09.1 (darwin)"
  }
}
```

The value of key `auth` is the base64 encoded string of the Docker registry credentials in the format `<username>:<password>`. As the host on which minikube runs is not accessible under `localhost` inside the Kubernetes cluster, we need to replace `localhost` appropriately. [Minikube v1.10](https://minikube.sigs.k8s.io/docs/handbook/host-access) adds a hostname entry `host.minikube.internal` to `/etc/hosts` which is the minikube-internal hostname of the host on which minikube is hosted. For this reason, we are using minikube v1.10.1. Therefore, we replace `localhost` by `host.minikube.internal` and store the resulting content in a temporary file called `$HOME/.docker/config.tmp.json`. It is this temporary file that we will use for the creation of the Secret. 

The YAML content representing the Secret looks as stated below where the value of key `.dockerconfigjson` equals the base64 encoded string of file `config.tmp.json`. We save this YAML content in file `jumbler-app-k8s/k8s/jumbler-secret.yaml`.

```
apiVersion: v1
kind: Secret
metadata:
  name: regsecret
  namespace: default
data:
  .dockerconfigjson: <base64 encoded string>
type: kubernetes.io/dockerconfigjson
```

In order to generate the base64 encoded string we run the following command:

```
$ base64 $HOME/.docker/config.tmp.json
<base64 encoded string>
```

We get the YAML file of our Secret by replacing the placeholder `<base64 encoded string>` by the resulting base64 encoded string. 
## Starting Minikube

Before we start our Kubernetes cluster we need to make it trust the TLS certificate of our private Docker registry (see documentation about [Untrusted Root Certificates](https://minikube.sigs.k8s.io/docs/handbook/untrusted_certs)).

```
$ mkdir -p $HOME/.minikube/certs
$ cp $HOME/certs/regauth.cert $HOME/.minikube/certs/.
```

We can now start minikube by having it use the hypervisor [VirtualBox](https://virtualbox.org) to create a virtual machine inside which to run our single-node Kubernetes cluster. We deactivate TLS verification so as to have minikube ignore the fact that our TLS certificate is self-signed.

```
$ minikube start --vm-driver=virtualbox --docker-env DOCKER_TLS_VERIFY=""
```

With the following command we check if `/etc/hosts` inside minikube contains the entry `host.minikube.internal`.

```
$ minikube ssh grep host.minikube.internal /etc/hosts
192.168.99.1	host.minikube.internal
```

# Deploying Kubernetes objects

In this example of an application deployment to a Kubernetes cluster we are taking the declarative approach to get our React app up and running (as opposed to the imperative approach). That is, we apply a set of YAML config files using `kubectl` to define Kubernetes resources in our Kubernetes cluster. By applying these YAML config files we communicate the descired state of our application to the control plane of our Kubernetes cluster. The control plane will then manage the Kubernetes cluster to reach the desired state.

First of all, we need to activate a resource that allows traffic to get into our application. This resource is [`ingress-nginx`](https://github.com/kubernetes/ingress-nginx), an Ingress controller for Kubernetes using NGINX as a reverse proxy and load balancer. This resource is already built into minikube. We just have to activate it using the following command:

```
$ minikube addons enable ingress
🌟  The 'ingress' addon is enabled
```

We are now ready to deploy the Kubernetes objects to our Kubernetes cluster in order to get our React app up and running. We have the four Kubernetes objects listed in the following table.

| Filename                          | Kind of object | Description                                                                                     |
| :-------------------------------- | :------------- | :---------------------------------------------------------------------------------------------- |
| `jumbler-secret.yaml`             | Secret         | The secret to be used by our Kubernetes cluster to pull images from our private Docker registry |
| `jumbler-deployment.yaml`         | Deployment     | The deployment definition of our React app requesting the creation of 2 pods                    |
| `jumbler-cluster-ip-service.yaml` | Service        | The cluster IP service that routes traffic from the Ingress controller to our deployment        |
| `ingress-service.yaml`            | Ingress        | The Ingress NGINX configuration defining the routing rules to be used by the Ingress controller |

If the flag -f is used in combination with a directory, then each YAML file inside that directory will be applied.

```
$ cd jumbler-app-k8s
$ kubectl apply -f k8s
ingress.extensions/ingress-service created
service/jumbler-cluster-ip-service created
deployment.apps/jumbler-deployment created
secret/regsecret created
```

Check on the command line if the image could be pulled from the private Docker registry and if the pods are running.

```
$ kubectl describe pods
...
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  17s   default-scheduler  Successfully assigned default/jumbler-deployment-74ed2a1b30-zht5e to minikube
  Normal  Pulling    16s   kubelet, minikube  Pulling image "host.minikube.internal:5021/<name>/jumbler"
  Normal  Pulled     16s   kubelet, minikube  Successfully pulled image "host.minikube.internal:5021/<name>/jumbler"
  Normal  Created    16s   kubelet, minikube  Created container jumbler
  Normal  Started    16s   kubelet, minikube  Started container jumbler
```

```
$ kubectl get pods
NAME                                  READY   STATUS    RESTARTS   AGE
jumbler-deployment-74ed2a1b30-t5wnd   1/1     Running   0          57s
jumbler-deployment-74ed2a1b30-zht5e   1/1     Running   0          57s
```

Get the IP address of our node. If no node is specified, it defaults to the primary control plane.

```
$ minikube ip
<IP address>
```

We do not have to specify a port on this IP address as the Ingress service which we have just activated is listening on both ports 80 and 443.

Call http://\<IP address\> in your browser and you should see the React app working.

We can inspect our secret with the following command and get its content in JSON format: 

```
$ kubectl get secret regsecret --output="jsonpath={.data.\.dockerconfigjson}" | base64 --decode
```

We can stop and delete our minikube cluster via the commands `minikube stop` and `minikube delete`. For more information about minikube, see the [minikube](https://minikube.sigs.k8s.io) documentation.

# Installation Instructions

## Docker Desktop and VirtualBox

Use the `dmg` file of Docker Desktop and VirtualBox for installation on macOS. 
## minikube

If a version other than v1.10.1 is already installed, make a backup from it and make sure that `/usr/local/bin/minikube` no longer exists.

Download and install the binary:

```
$ curl -Lo minikube https://storage.googleapis.com/minikube/releases/v1.10.1/minikube-darwin-amd64
$ chmod +x minikube
$ sudo mv minikube /usr/local/bin
$ minikube version
minikube version: v1.10.1
```
## kubectl

If a version other than v1.18.2 is already installed, make a backup from it and make sure that `/usr/local/bin/kubectl` no longer exists.

Download and install the binary:

```
$ curl -LO https://dl.k8s.io/release/v1.18.2/bin/darwin/amd64/kubectl
$ chmod +x ./kubectl
$ sudo mv ./kubectl /usr/local/bin/kubectl
$ sudo chown root: /usr/local/bin/kubectl
$ kubectl version --client --short
Client Version: v1.18.2
```

