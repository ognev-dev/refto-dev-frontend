#!/bin/bash

# this is straightforward deploy to remote that does the job for me for now.
# probably later I'll need to add a hook to deploy on merge

# how to use:
# 1. copy this file to elsewhere out of git
# 2. set variables that is just right below
# 3. run this script


# local project's dir to deploy from
projectDir=~/projects/refto/frontend
# remote project's dir to deploy to
remoteProjectDir=/project/server/web/_nuxt
# path to where index.html should be copied
serverRoot=/project/server/web
# remote's user
remoteUser=
# remote's addr
remoreAddr=
# server's API addr
serverApiAddr=
# public path
nuxtPublicPath=
# Google Analytics ID
gaID=
# Github Client ID
githubClientID=

cd $projectDir || exit

# set vars for prod
export REFTO_API_ADDR=$serverApiAddr
export NUXT_PUBLIC_PATH=$nuxtPublicPath
export GA_ID=$gaID
export REFTO_GITHUB_CLIENT_ID=$githubClientID

echo "Building frontend..."
npm run generate

echo "Making archive..."
tar -czf refto-frontend.tar.gz ./dist

echo "Uploading archive..."
scp refto-frontend.tar.gz "${remoteUser}@${remoreAddr}":~/

echo "Connecting to remote..."
ssh -T "${remoteUser}@${remoreAddr}" << EOF
echo "Preparing..."
rm -rf ~/frontend-release-tmp || exit
mkdir ~/frontend-release-tmp || exit
echo "Extracting archive..."
tar -xzf refto-frontend.tar.gz -C ~/frontend-release-tmp || exit

echo "Copying project..."
rm -rf $remoteProjectDir || exit
mv ~/frontend-release-tmp/dist/200.html $serverRoot/index.html || exit
mv ~/frontend-release-tmp/dist $remoteProjectDir || exit

echo "Cleaning..."
rm -f ~/refto-frontend.tar.gz || exit
rm -rf ~/frontend-release-tmp || exit
EOF

# cleanup env
unset REFTO_API_ADDR
unset NUXT_PUBLIC_PATH
unset GA_ID
unset REFTO_GITHUB_CLIENT_ID
rm -f refto-frontend.tar.gz

echo "Frontend deployed!"
