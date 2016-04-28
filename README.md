# eliminate 5082

Finally identify and eliminate the root cause of [`npm/npm#5082`](https://github.com/npm/npm/issues/5082).

## currently known facts

1. on the machines available to me, doesn't happen at all
2. happens during tarball creation, so can be triggered with `npm pack` (and doesn't require a full npm publish)
4. [doesn't just happen for `index.js`](https://github.com/npm/npm/issues/5082#issuecomment-215260961)
5. requires a pre-existing, shared cache
6. files are being included after being run through fstream-npm and fstream-ignore's exclusion rules

## current hypotheses

1. is two race condtions
  - the source of #5082 is something that causes files to not be included in the packed tarball
  - another one happens even more rarely within the npm cache and is linked to multiple runs of npm operating on the same package simultaneously
2. is occurring in either `fstream`, `fstream-npm`, `fstream-ignore`, `node-tar`, or npm's `lib/utils/tar.js`
3. seems to be happening more in Node.js 6.0.0:
  - https://twitter.com/SamVerschueren/status/725308337169006597
  - https://twitter.com/sindresorhus/status/725351897629077504
4. is happening when a file that explicitly shouldn't be ignored is nevertheless not making it into the tarball

## current approach

1. ~~add all basic scenarios~~
2. ~~create a stress-testing harness that will run the tests concurrently ~10 or so times~~
3. instrument npm to figure out where the entries are getting dropped

## plz help

```sh
git clone https://github.com/othiym23/eliminate-5082
cd eliminate-5082
npm it
```
