# Changelog

## [1.7.0](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.6.0...v1.7.0) (2025-10-21)


### Features

* **unicorn:** submit siwe data to extract wallet address ([#38](https://github.com/lemonadesocial/lemonade-identityOS/issues/38)) ([c14fa31](https://github.com/lemonadesocial/lemonade-identityOS/commit/c14fa31f111d21a2be8edbf618715a37b439e098))


### Bug Fixes

* **unicorn:** update identity when login with unicorn siwe ([#40](https://github.com/lemonadesocial/lemonade-identityOS/issues/40)) ([7a0c115](https://github.com/lemonadesocial/lemonade-identityOS/commit/7a0c115303fa0e2ce159b4875029e2294e665147))

## [1.6.0](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.5.0...v1.6.0) (2025-08-29)


### Features

* **farcaster:** implement with Farcaster SIWE ([#33](https://github.com/lemonadesocial/lemonade-identityOS/issues/33)) ([1219e4a](https://github.com/lemonadesocial/lemonade-identityOS/commit/1219e4ab89459b7e6c14822db9a9e39ab6f9e7d1))

## [1.5.0](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.4.0...v1.5.0) (2025-08-22)


### Features

* **login:** handle default oidc provider ([#29](https://github.com/lemonadesocial/lemonade-identityOS/issues/29)) ([50f5a4c](https://github.com/lemonadesocial/lemonade-identityOS/commit/50f5a4c31143235aeda442673a0ccd8cfbae3fe6))
* **verification:** add setting & verification routes ([#30](https://github.com/lemonadesocial/lemonade-identityOS/issues/30)) ([ba44740](https://github.com/lemonadesocial/lemonade-identityOS/commit/ba44740f9389c032b570ffa0b1cfa789d2c5c26a))

## [1.4.0](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.3.0...v1.4.0) (2025-08-21)


### Features

* **oauth2:** implement native flow for whitelabel ([#26](https://github.com/lemonadesocial/lemonade-identityOS/issues/26)) ([fa59ff4](https://github.com/lemonadesocial/lemonade-identityOS/commit/fa59ff448d09e7643266ebf6b8c304e8c7307f76))

## [1.3.0](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.2.1...v1.3.0) (2025-08-15)


### Features

* add env ([a579d43](https://github.com/lemonadesocial/lemonade-identityOS/commit/a579d43c3cb2819da6dcb3c08841120cb39b130a))
* **farcaster:** handle login with Farcaster JWT ([9b5c6ed](https://github.com/lemonadesocial/lemonade-identityOS/commit/9b5c6ed6104917ec8e237ba75b14e301da88feb4))
* implement verify jwt ([1efc3a9](https://github.com/lemonadesocial/lemonade-identityOS/commit/1efc3a9cb5271af1fb9a698240115c6c7a215ba3))
* return identityId if matched ([a4c19ab](https://github.com/lemonadesocial/lemonade-identityOS/commit/a4c19ab2e943c531185cddd7bc5e06f501930a3d))
* set password after link with unicorn ([a8ad0f3](https://github.com/lemonadesocial/lemonade-identityOS/commit/a8ad0f37f17359ac76928841252bebae8f1add9e))
* update cors for some APIs ([0a7a961](https://github.com/lemonadesocial/lemonade-identityOS/commit/0a7a96126b05265f616598f182d92e3bd21262e4))


### Bug Fixes

* fix canlink check & add force redirect ([c4f96ab](https://github.com/lemonadesocial/lemonade-identityOS/commit/c4f96ab636baf565383c2c8c031456a85d4fc0c2))

## [1.2.1](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.2.0...v1.2.1) (2025-07-14)


### Bug Fixes

* **consent:** remove user id in oauth2 token ([a78502e](https://github.com/lemonadesocial/lemonade-identityOS/commit/a78502e724c80d2c58ae7ef2b9a0976f2e49801c))

## [1.2.0](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.1.1...v1.2.0) (2025-07-14)


### Features

* **logout:** add logout page ([fd4506a](https://github.com/lemonadesocial/lemonade-identityOS/commit/fd4506ade03bf6bf1b09f10b7a8788af1a1762da))

## [1.1.1](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.1.0...v1.1.1) (2025-07-14)


### Bug Fixes

* **oauth2:** fix config oauth2 base path ([44a4981](https://github.com/lemonadesocial/lemonade-identityOS/commit/44a4981484ed837a1a6b64d5648fed3928e818bf))

## [1.1.0](https://github.com/lemonadesocial/lemonade-identityOS/compare/v1.0.0...v1.1.0) (2025-07-08)


### Features

* rename env ([8f35a2e](https://github.com/lemonadesocial/lemonade-identityOS/commit/8f35a2e0802b9617794a886fa370405124e898fd))


### Bug Fixes

* **wallet:** use lowercase wallet address ([cc1af73](https://github.com/lemonadesocial/lemonade-identityOS/commit/cc1af739bf0bcc0551931e6f8a3fdb63cad694da))

## 1.0.0 (2025-07-07)


### Features

* add family wallet connect button ([adb56c3](https://github.com/lemonadesocial/lemonade-identityOS/commit/adb56c36b61bb9b80f4916ba39a8a0b89f569d1c))
* add wallet page to handle login/signup with wallet ([3b6262a](https://github.com/lemonadesocial/lemonade-identityOS/commit/3b6262aacf9fdcae0974585b4f2a0a24f1b0b493))
* allow cors for wallet API ([a646e34](https://github.com/lemonadesocial/lemonade-identityOS/commit/a646e3450787d10cab768e34e8f29e52bbdcc4ab))
* **build:** add build scripts ([00ff570](https://github.com/lemonadesocial/lemonade-identityOS/commit/00ff570f0806031c6bccf525dfa4e5a81f72ddcb))
* **consent:** add consent page and refactor UI ([1ec91f8](https://github.com/lemonadesocial/lemonade-identityOS/commit/1ec91f89b7e251db09448ff7c12dccfb59b114ac))
* **git:** add workflows ([fbac559](https://github.com/lemonadesocial/lemonade-identityOS/commit/fbac559c546f21879b0aa65b0d9b1df3bfffc11c))
* handle flow error ([b4531f5](https://github.com/lemonadesocial/lemonade-identityOS/commit/b4531f5fff5e59d06a22b1544ec8f8d590ccfc2c))
* handle login error without reload page ([395e4b8](https://github.com/lemonadesocial/lemonade-identityOS/commit/395e4b8bf0664d64a53fbf67baf389f52829757d))
* handle registration flow error ([e8fd9b6](https://github.com/lemonadesocial/lemonade-identityOS/commit/e8fd9b6787bd436064a6d52449c37ad27c08689b))
* handle registration with wallet ([48a20db](https://github.com/lemonadesocial/lemonade-identityOS/commit/48a20db26ff3ba73f1ec82516ce35b8eb1e6269b))
* hide password reset in settings ([59ffeb6](https://github.com/lemonadesocial/lemonade-identityOS/commit/59ffeb60f61fe680e8738d3cc0d993582ed71ee9))
* implement connect & signature request ([58f8c1d](https://github.com/lemonadesocial/lemonade-identityOS/commit/58f8c1df2329a72d88644e6c92bd62b6a5258f88))
* implement login with wallet ([5d18823](https://github.com/lemonadesocial/lemonade-identityOS/commit/5d188234f40c4d3632ba4ef67824aa3237d85254))
* link wallet in setting flow ([419d68f](https://github.com/lemonadesocial/lemonade-identityOS/commit/419d68f054a92eff5475fff6f57c3ac24fb5f7eb))
* **logout:** fix logout flow link ([4573ef3](https://github.com/lemonadesocial/lemonade-identityOS/commit/4573ef3cc8fdc15bef64aca35db0ad7d2f25120f))
* **pages:** add error page ([1216279](https://github.com/lemonadesocial/lemonade-identityOS/commit/121627935c0489d10b7d471c9b33728568beea97))
* return better webhook error response ([d7710bc](https://github.com/lemonadesocial/lemonade-identityOS/commit/d7710bcefd688a35c6e420e792a6f7ade36f93be))
* **ui:** implement basic UI for all flows ([030d715](https://github.com/lemonadesocial/lemonade-identityOS/commit/030d715c44384bb4d9de3c751b3ff163ebd755e2))
* **ui:** improve overall UI ([5637a97](https://github.com/lemonadesocial/lemonade-identityOS/commit/5637a973079b2d00ed6a8d07ce1ecbc500985752))
* **ui:** update recovery flow UI ([cd1131a](https://github.com/lemonadesocial/lemonade-identityOS/commit/cd1131aa3fbde1e91feb3dedda66350005fe0cfd))
* **ui:** update settings UI ([f5309ec](https://github.com/lemonadesocial/lemonade-identityOS/commit/f5309ecf5724d45058aff52e18143fccc4f91fd3))
* **ui:** update UI for login & signup ([7e7f7d6](https://github.com/lemonadesocial/lemonade-identityOS/commit/7e7f7d643188b93ce3091d3720757fc5ab45b957))
* unlink wallet in settings ([b7ca909](https://github.com/lemonadesocial/lemonade-identityOS/commit/b7ca90984d845b0f585ff53fea731783a5b003c0))
* update wallet also update password ([3c30c3b](https://github.com/lemonadesocial/lemonade-identityOS/commit/3c30c3b28d29cfe5e2992a3bcfc8fe92cc04e816))
* update workflow secrets ([abee7d0](https://github.com/lemonadesocial/lemonade-identityOS/commit/abee7d0f91ad3338353c137f727ea2f701eb5fc5))


### Bug Fixes

* add login custom form root ([cdd6d08](https://github.com/lemonadesocial/lemonade-identityOS/commit/cdd6d0805aac9ba9a04e10036a0823f0094dffb6))
* **build:** fix build issue ([a318172](https://github.com/lemonadesocial/lemonade-identityOS/commit/a318172580969082fd1574a466b94c5aa1d5d1a2))
* **config:** fix cookie domain conflict ([f95010d](https://github.com/lemonadesocial/lemonade-identityOS/commit/f95010d27e6c6e602efa9b9bca49215d14d7c282))
* **consent:** fix consent API call ([676ec03](https://github.com/lemonadesocial/lemonade-identityOS/commit/676ec031dcfc87c35cf46c9d626939cf23bfe886))
* disconnect wallet after success signature ([ffa97e5](https://github.com/lemonadesocial/lemonade-identityOS/commit/ffa97e521efb89359eb5cd73f9ac3ea1f30854e4))
* fix build issue ([2cb67e9](https://github.com/lemonadesocial/lemonade-identityOS/commit/2cb67e946451446d8680cf2eb5841057ad9bdf73))
* fix login email input title ([d34163e](https://github.com/lemonadesocial/lemonade-identityOS/commit/d34163eead687bab27d1fd346d730b6c02734a40))
* fix registration with code also submit wallet ([cccdc4f](https://github.com/lemonadesocial/lemonade-identityOS/commit/cccdc4fa17be9c9b584d9f462f3d773c435c3244))
* fix setting flow showing error ([9940f96](https://github.com/lemonadesocial/lemonade-identityOS/commit/9940f96c5ea9630b005d37605a06896dadc0a0f7))
* fix signature check ([0a2bff2](https://github.com/lemonadesocial/lemonade-identityOS/commit/0a2bff2039d889d28101bbd449aff704a99f6ee0))
* fix unlink wallet ([e232026](https://github.com/lemonadesocial/lemonade-identityOS/commit/e2320262c2313ed2f20670bcac5896e57d5274d7))
* fix unlink wallet ([758e71d](https://github.com/lemonadesocial/lemonade-identityOS/commit/758e71d64e4ed83460fc261c1c1a874d18bf877f))
* fix update profile stucked when wallet is connected ([ebcc96c](https://github.com/lemonadesocial/lemonade-identityOS/commit/ebcc96c0bd00c4959d8b644e46235b33fdfbf130))
* fix update profile when there is no email ([ad6800e](https://github.com/lemonadesocial/lemonade-identityOS/commit/ad6800ea32fa6a3b1c3aa7d1b5ab93fbe54ebe48))
* fix verification not redirect ([831308c](https://github.com/lemonadesocial/lemonade-identityOS/commit/831308c51feb8afd160a506a9341d7fe955cf268))
* fix web3 config ([f19fd9f](https://github.com/lemonadesocial/lemonade-identityOS/commit/f19fd9fb60f146929fa41dbfc09beb585d674137))
* improve wallet unlink ([083c46d](https://github.com/lemonadesocial/lemonade-identityOS/commit/083c46db3b7333d58cbbfb57d9b13128357f1af8))
* improve webhook messages ([6094902](https://github.com/lemonadesocial/lemonade-identityOS/commit/60949026005a9445551b8d824ccea4457432ae3f))
* not sign if wallet is connected ([1b64155](https://github.com/lemonadesocial/lemonade-identityOS/commit/1b6415592991a028e674275fec9d88978ca1c4b6))
