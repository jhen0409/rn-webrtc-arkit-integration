#/bin/bash -e

lerna publish $1 --conventional-commits

cd packages/RNWebRTCARExample
yarn sync version
cd -

git add RNWebRTCARExample/
git commit -m '[Example] Sync version'
git push
