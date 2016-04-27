# eliminate 5082

Finally identify and eliminate the root cause of [`npm/npm#5082`](https://github.com/npm/npm/issues/5082).

## currently known facts

1. on the machines available to me, happens extremely infrequently (< 5%)
2. happens during tarball creation, so can be triggered with `npm pack` (and doesn't require a full npm publish)
3. so far, only observed to happen in packages where `main` is set
4. doesn't just happen for `index.js`
5. requires a pre-existing, shared cache

## current hypotheses

1. is a race condtion
2. is occurring in either fstream, fstream-npm, fstream-ignore, or npm's `lib/utils/tar.js`
3. seems to be happening more in Node.js 6.0.0:
  - https://twitter.com/SamVerschueren/status/725308337169006597
  - https://twitter.com/sindresorhus/status/725351897629077504

## current approach

1. ~~add all basic scenarios~~
2. create a stress-testing harness that will run the tests concurrently ~10 or so times

## plz help

```sh
git clone https://github.com/othiym23/eliminate-5082
cd eliminate-5082
npm it
```
