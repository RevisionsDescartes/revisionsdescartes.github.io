// Vignettes supplémentaires (même style, viewBox 64x44, cadrage 7 4 50 34.4). Dessins originaux.
const B = (c) => `<rect width="64" height="44" fill="${c}"/>`;
const sh = (c, ry = 3) => `<ellipse cx="32" cy="36.5" rx="21" ry="${ry}" fill="${c}"/>`;
const plate = `<ellipse cx="32" cy="31" rx="23" ry="7" fill="#FFFFFF"/><ellipse cx="32" cy="31" rx="18" ry="5" fill="#F2F2EE"/>`;
const bowl = (c, rim = '#FFFFFF') => `<path d="M12 22h40c0 9-8 15-20 15S12 31 12 22z" fill="${c}"/><path d="M12 22h40" stroke="${rim}" stroke-width="1.2"/>`;
const X = {
 barre: B('#F3E7D3') + sh('#E0CDAF') + `
  <g transform="rotate(-12 32 24)"><rect x="12" y="17" width="40" height="11" rx="2.5" fill="#C99A5B"/>
  <g fill="#E8C68C"><ellipse cx="17" cy="21" rx="2" ry="1.2"/><ellipse cx="24" cy="24" rx="2.2" ry="1.1"/><ellipse cx="31" cy="20.5" rx="1.8" ry="1.1"/><ellipse cx="38" cy="24.5" rx="2" ry="1.2"/><ellipse cx="45" cy="21" rx="2.1" ry="1.1"/></g>
  <g fill="#7A4A22"><circle cx="20" cy="25" r="1"/><circle cx="34" cy="25.5" r="1"/><circle cx="42" cy="19.5" r="1"/><circle cx="28" cy="19" r=".9"/></g>
  <path d="M13 17h38v3.5c-3 1.5-5-1-7 .5s-4 2-6 0-4-1-6 .5-4 1-6-.5-4-1-6 .5-5 .5-7-1z" fill="#5A2E17"/></g>`,
 energie: B('#F1E6DA') + `<ellipse cx="32" cy="33" rx="23" ry="6" fill="#FFFFFF"/>` + `
  <circle cx="22" cy="27" r="7" fill="#B07A45"/><circle cx="36" cy="28" r="7" fill="#9C6838"/><circle cx="29" cy="19.5" r="7" fill="#C08852"/><circle cx="44" cy="21" r="6" fill="#B07A45"/>
  <g fill="#F5EBDD"><circle cx="20" cy="25" r=".9"/><circle cx="24" cy="29" r=".8"/><circle cx="34" cy="26" r=".8"/><circle cx="38" cy="30" r=".9"/><circle cx="27" cy="17" r=".8"/><circle cx="31" cy="21" r=".9"/><circle cx="43" cy="19" r=".8"/><circle cx="46" cy="23" r=".8"/></g>
  <g fill="#5A2E17"><circle cx="23" cy="26" r=".7"/><circle cx="35" cy="29" r=".7"/><circle cx="30" cy="18" r=".7"/></g>`,
 yaourt: B('#E8F0FA') + sh('#CBD8EA') + `
  <path d="M17 18h30l-3 17H20z" fill="#FFFFFF"/><path d="M17 18h30l-.6 3.4H17.6z" fill="#E9EEF6"/>
  <ellipse cx="32" cy="18" rx="15" ry="3.6" fill="#FFFDF7"/>
  <path d="M22 17.5c3-1.6 6 1 9-.4s6-1.8 9 .2" stroke="#8A5A2E" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <circle cx="36" cy="14.5" r="2.4" fill="#D83A55"/><circle cx="31" cy="14.2" r="2.2" fill="#3C3A8E"/><circle cx="28" cy="16" r="1.6" fill="#D83A55"/>
  <path d="M41 13 51 5" stroke="#B9BEC6" stroke-width="2" stroke-linecap="round"/>`,
 glace: B('#FDE6EE') + sh('#F1C6D6') + `
  <path d="M24 19h16l-8 18z" fill="#E3A961"/><path d="M26 22l9 6M28 27l5 3M38 22l-10 7M36 27l-5 4" stroke="#C98840" stroke-width=".9"/>
  <circle cx="27" cy="16" r="6" fill="#F6A6BE"/><circle cx="37" cy="16" r="6" fill="#FFF3D9"/><circle cx="32" cy="10" r="6" fill="#6B3A22"/>
  <path d="M26 21c1.4 0 1.4 2.4 2.8 2.4S30 21 31.4 21" fill="#F6A6BE"/><circle cx="34" cy="7.5" r="1.4" fill="#D83A55"/>`,
 popcorn: B('#FFF0D6') + sh('#EED8B4') + `
  <path d="M19 16h26l-3 20H22z" fill="#FFFFFF"/><path d="M22 16l2 20M28 16l.6 20M36 16l-.6 20M42 16l-2 20" stroke="#E5402F" stroke-width="2.6"/>
  <g fill="#FFF8E6" stroke="#EBD7A6" stroke-width=".6"><circle cx="21" cy="15" r="3.4"/><circle cx="27" cy="12.5" r="3.6"/><circle cx="33" cy="11" r="3.8"/><circle cx="39" cy="12.5" r="3.6"/><circle cx="44" cy="15" r="3.2"/><circle cx="30" cy="16" r="3"/><circle cx="37" cy="16" r="3"/><circle cx="24" cy="9" r="2.8"/><circle cx="41" cy="8.4" r="2.6"/></g>
  <g fill="#F2C14E"><circle cx="27" cy="12" r="1"/><circle cx="39" cy="12" r="1"/><circle cx="33" cy="10" r=".9"/></g>`,
 sushi: B('#E6F1EC') + `<rect x="10" y="29" width="44" height="6" rx="2" fill="#3B3B3B"/>` + `
  <circle cx="19" cy="23" r="6.5" fill="#1F3B2A"/><circle cx="19" cy="23" r="5.2" fill="#FFFFFF"/><circle cx="19" cy="23" r="2.2" fill="#F07A55"/><circle cx="18" cy="24.5" r=".9" fill="#7CC36A"/>
  <circle cx="33" cy="23" r="6.5" fill="#1F3B2A"/><circle cx="33" cy="23" r="5.2" fill="#FFFFFF"/><circle cx="33" cy="23" r="2.2" fill="#F07A55"/><circle cx="34.2" cy="24.4" r=".9" fill="#F2C14E"/>
  <ellipse cx="47" cy="25" rx="6.5" ry="3.4" fill="#FFFFFF"/><path d="M40.5 23c2-3 11-3 13 0l-1 2c-3-1.6-8-1.6-11 0z" fill="#F07A55"/><path d="M43 21.6l1 3M46 21l.6 3.4M49 21.4l.4 3" stroke="#FFC2A8" stroke-width=".8"/>
  <path d="M8 12 30 18M10 9 31 16" stroke="#B5783E" stroke-width="1.6" stroke-linecap="round"/>`,
 nougat: B('#FBF1DE') + sh('#E9D9B7') + `
  <path d="M12 20l14-6 24 6-14 7z" fill="#FFF7E4"/><path d="M12 20l24 7v8L12 28z" fill="#F4E6C6"/><path d="M36 27l14-7v8l-14 7z" fill="#E9D5A7"/>
  <g fill="#9BC46A"><ellipse cx="18" cy="24" rx="1.4" ry="1"/><ellipse cx="27" cy="29" rx="1.4" ry="1"/><ellipse cx="22" cy="22" rx="1" ry=".8"/></g>
  <g fill="#C08A4E"><ellipse cx="24" cy="26" rx="1.6" ry="1"/><ellipse cx="32" cy="30" rx="1.4" ry="1"/><ellipse cx="16" cy="26" rx="1.2" ry=".9"/><ellipse cx="42" cy="27" rx="1.4" ry="1"/><ellipse cx="47" cy="24" rx="1.2" ry=".9"/></g>
  <g fill="#EADBB8"><ellipse cx="25" cy="18" rx="1.4" ry=".8"/><ellipse cx="36" cy="19" rx="1.4" ry=".8"/></g>`,
 burger: B('#FDEBD6') + sh('#EED3B2') + `
  <path d="M15 19c0-7 8-10 17-10s17 3 17 10z" fill="#E09A45"/><g fill="#FFF4D6"><ellipse cx="24" cy="13" rx="1.2" ry=".7"/><ellipse cx="31" cy="11.4" rx="1.2" ry=".7"/><ellipse cx="38" cy="13" rx="1.2" ry=".7"/><ellipse cx="34" cy="15.4" rx="1.2" ry=".7"/></g>
  <path d="M14 20c4 2 6-1 9 1s6-1 9 1 6-1 9 1 6-1 9 0v1H14z" fill="#5FAE45"/><rect x="14" y="21.4" width="36" height="3" rx="1" fill="#E5402F"/>
  <path d="M15 24.6h34l-2 3.4-4-2-4 2.6-3-2.6-4 2.6-3-2.6-4 2.6-3-2.6-4 2.6z" fill="#F7C93A"/>
  <rect x="14" y="26.4" width="36" height="5" rx="2.5" fill="#6B3420"/><path d="M15 31.4h34c0 3-3 4.6-6 4.6H21c-3 0-6-1.6-6-4.6z" fill="#D88A3C"/>`,
 wrap: B('#FFF0DA') + sh('#EED8B6') + `
  <g transform="rotate(-20 32 24)"><path d="M14 18h30c4 0 6 3 6 7s-2 7-6 7H14c3-4 3-10 0-14z" fill="#F2D19A"/>
  <ellipse cx="14" cy="25" rx="3.6" ry="7" fill="#E7BC7A"/><ellipse cx="14" cy="25" rx="2.6" ry="5.6" fill="#F7E3BC"/>
  <circle cx="13.4" cy="22.6" r="1.4" fill="#5FAE45"/><circle cx="14.8" cy="26" r="1.4" fill="#E5402F"/><circle cx="13" cy="27.6" r="1.1" fill="#B76A3A"/>
  <path d="M22 20c2 3 2 7 0 10M32 19c2 3.4 2 8 0 11.6" stroke="#DDB377" stroke-width="1" fill="none"/>
  <g fill="#C98A4E" opacity=".6"><circle cx="27" cy="23" r=".9"/><circle cx="38" cy="27" r=".9"/><circle cx="43" cy="22" r=".8"/></g></g>`,
 frites: B('#FFEED2') + sh('#EED6B0') + `
  <g fill="#F6C443" stroke="#E0A62A" stroke-width=".5"><rect x="20" y="6" width="3.4" height="18" rx="1" transform="rotate(-12 21 15)"/><rect x="25" y="4" width="3.4" height="20" rx="1" transform="rotate(-4 26 14)"/><rect x="30" y="5" width="3.4" height="19" rx="1" transform="rotate(3 31 14)"/><rect x="35" y="6" width="3.4" height="18" rx="1" transform="rotate(9 36 15)"/><rect x="40" y="8" width="3.4" height="16" rx="1" transform="rotate(16 41 16)"/><rect x="27.6" y="8" width="3.2" height="16" rx="1" transform="rotate(-8 29 16)"/><rect x="33" y="8.6" width="3.2" height="16" rx="1" transform="rotate(12 34 16)"/></g>
  <path d="M18 18h28l-3 18H21z" fill="#E5402F"/><path d="M18 18h28c-2 4-6 6-14 6s-12-2-14-6z" fill="#C8352B"/>
  <path d="M28 30c2-2.6 6-2.6 8 0-1 2-7 2-8 0z" fill="#FFFFFF" opacity=".85"/>`,
 puree: B('#FFF6DD') + `<ellipse cx="32" cy="36.5" rx="19" ry="2.6" fill="#EADCB0"/>` + bowl('#5F8FD6', '#A9C4EE') + `
  <path d="M13 22c1-6 7-9 12-8 3-3 10-3 13 0 5-1 11 2 12 8z" fill="#FBE7A6"/>
  <path d="M19 19c3-2 6-2 8 0s6 2 9-.6 6-1.4 8 .6" stroke="#E6CA72" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  <rect x="29" y="12.4" width="6" height="4" rx="1" fill="#FFE27A"/><circle cx="24" cy="18" r=".8" fill="#4E9A3A"/><circle cx="39" cy="17" r=".8" fill="#4E9A3A"/>`,
 nuggets: B('#FDEBD3') + plate + `
  <path d="M15 27c0-4 3-6 6-6 4-1 7 1 7 4 1 3-1 6-6 6-4 1-7-1-7-4z" fill="#D9933E"/>
  <path d="M27 22c0-4 4-6 7-5 4-1 7 2 6 5 1 4-3 6-7 5-4 1-7-1-6-5z" fill="#E3A24C"/>
  <path d="M35 29c0-3 3-5 6-5 4 0 6 2 6 5s-3 5-6 5c-4 0-6-2-6-5z" fill="#D18A36"/>
  <g fill="#B26A22"><circle cx="19" cy="25" r=".7"/><circle cx="23" cy="28" r=".7"/><circle cx="31" cy="20" r=".7"/><circle cx="36" cy="23" r=".7"/><circle cx="39" cy="28" r=".7"/><circle cx="44" cy="30" r=".7"/></g>
  <path d="M44 19c3-1 6 0 7 2-2 1-5 1-7-2z" fill="#E5402F"/>`,
 quiche: B('#FFF2D8') + sh('#EEDAB6') + `
  <ellipse cx="32" cy="27" rx="21" ry="8" fill="#C68A4F"/><ellipse cx="32" cy="25" rx="21" ry="8" fill="#E3AF6E"/>
  <path d="M11 25c1-1 2 1 3 0s2 1 3 0M47 25c1-1 2 1 3 0" stroke="#C68A4F" stroke-width="1"/>
  <ellipse cx="32" cy="24.6" rx="17.6" ry="6" fill="#F6D57A"/>
  <g fill="#4E8A3A"><ellipse cx="25" cy="23" rx="2.6" ry="1.4"/><ellipse cx="34" cy="26" rx="2.4" ry="1.3"/><ellipse cx="39" cy="22" rx="2.2" ry="1.2"/><ellipse cx="29" cy="27.4" rx="1.8" ry="1"/></g>
  <g fill="#E8A23C" opacity=".8"><circle cx="30" cy="22" r="1"/><circle cx="42" cy="25" r="1"/><circle cx="22" cy="26" r=".9"/></g>`,
 mugcake: B('#F6E7E1') + sh('#E6CBBF') + `
  <path d="M18 17h22v16c0 2-2 3.6-4 3.6H22c-2 0-4-1.6-4-3.6z" fill="#E5402F"/><path d="M40 21h3c3 0 4.6 2 4.6 4.6S46 30 43 30h-3" stroke="#E5402F" stroke-width="2.6" fill="none"/>
  <path d="M17 17c0-5 5-8 12-8s12 3 12 8c0 1.4-1 2-2 2H19c-1 0-2-.6-2-2z" fill="#6B3A22"/>
  <path d="M20 15c3-2 6-1.4 9-2.6" stroke="#8C5434" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <path d="M22 17.6c0 2 1 2.6 1 4.4M33 18c0 2 1 3 1 4.4" stroke="#6B3A22" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="31" cy="10" r="1.2" fill="#FFF3D9"/><rect x="21" y="24" width="14" height="2" rx="1" fill="#FFFFFF" opacity=".7"/>`,
 brownie: B('#EFE2D6') + sh('#DECBB8') + `
  <path d="M13 21l16-7 22 6-16 8z" fill="#5A2E17"/><path d="M13 21l22 7v8L13 29z" fill="#6E3A1E"/><path d="M35 28l16-8v8l-16 8z" fill="#4A240F"/>
  <path d="M16 21.4l13-5.6 18 5" stroke="#3A1B0A" stroke-width=".8" fill="none"/>
  <g fill="#E8D2B0"><ellipse cx="24" cy="18" rx="1.6" ry=".9"/><ellipse cx="34" cy="20" rx="1.6" ry=".9"/><ellipse cx="41" cy="20.6" rx="1.4" ry=".8"/><ellipse cx="29" cy="22.6" rx="1.4" ry=".8"/></g>
  <g fill="#8C5434"><circle cx="18" cy="26" r=".9"/><circle cx="27" cy="31" r=".9"/><circle cx="23" cy="27" r=".8"/></g>`,
 muffin: B('#FDEBD9') + sh('#EED0B6') + `
  <path d="M20 22h24l-3 14H23z" fill="#D9672E"/><path d="M23 22l1.4 14M28 22l.6 14M33 22v14M38 22l-.6 14M42 22l-1.4 14" stroke="#B9521F" stroke-width="1"/>
  <path d="M17 22c-1-7 5-12 15-12s16 5 15 12c-4 2-26 2-30 0z" fill="#B87A3F"/>
  <g fill="#4A240F"><circle cx="24" cy="16" r="1.4"/><circle cx="31" cy="13.4" r="1.4"/><circle cx="38" cy="16" r="1.4"/><circle cx="28" cy="19" r="1.2"/><circle cx="35" cy="19.6" r="1.2"/><circle cx="42" cy="19" r="1.1"/><circle cx="21" cy="20" r="1"/></g>
  <path d="M23 14c2-2 5-3 8-3" stroke="#D59A5C" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
 cheesecake: B('#FBE4E8') + sh('#EFC7CF') + `
  <path d="M12 26 46 16l6 4-34 10z" fill="#FFF7E2"/>
  <path d="M12 26l6 4v5l-6-4z" fill="#F4E3BE"/><path d="M18 30l34-10v5L18 35z" fill="#FBEFD3"/>
  <path d="M12 31l6 4v3l-6-4zM18 35l34-10v3L18 38z" fill="#B8783E"/>
  <path d="M12 26 46 16l6 4-34 10z" fill="#D83A55" opacity=".92"/>
  <path d="M22 28.6c0 2 1 2.6 1 4.4M33 25.4c0 2 1 3 1 4.4M44 22.2c0 1.6.8 2.4.8 3.8" stroke="#B51E38" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="40" cy="16" r="2.8" fill="#C51F3B"/><circle cx="33" cy="18.6" r="2.4" fill="#3C3A8E"/><circle cx="39" cy="15" r=".8" fill="#FF9AAA"/>`,
 club: B('#FFF0D8') + sh('#EEDAB6') + `
  <path d="M10 33 32 9l22 24z" fill="#F7E3BC"/><path d="M10 33 32 9l22 24" stroke="#C98A4E" stroke-width="2" fill="none"/>
  <path d="M15 28h34" stroke="#5FAE45" stroke-width="2.6"/><path d="M18 24.6h28" stroke="#F2909A" stroke-width="2.6"/><path d="M21 21h22" stroke="#F7C93A" stroke-width="2.4"/><path d="M24 17.4h16" stroke="#E5402F" stroke-width="2.2"/>
  <path d="M12.6 31.2h38.8" stroke="#E9C88E" stroke-width="2"/><path d="M32 5v12" stroke="#B9BEC6" stroke-width="1.2"/><circle cx="32" cy="5" r="1.6" fill="#E5402F"/>`,
 tartine: B('#EEF5E2') + sh('#D6E3C2') + `
  <path d="M12 30V17c-2-1-2.4-3.6-1-5 1.6-2 6-3 21-3s19.4 1 21 3c1.4 1.4 1 4-1 5v13z" fill="#C98A4E" transform="rotate(-6 32 22)"/>
  <path d="M15 28V17.4c-1.4-.8-1.6-2.4-.8-3.4 1.2-1.4 5-2.2 17.8-2.2s16.6.8 17.8 2.2c.8 1 .6 2.6-.8 3.4V28z" fill="#F2D19A" transform="rotate(-6 32 22)"/>
  <ellipse cx="25" cy="21" rx="7" ry="5" fill="#9CC75B"/><ellipse cx="25" cy="21" rx="5" ry="3.4" fill="#C9E28A"/>
  <ellipse cx="39" cy="20" rx="6.4" ry="4.6" fill="#FFFFFF"/><circle cx="39.6" cy="19.6" r="2.6" fill="#F6B42A"/>
  <g fill="#E5402F"><circle cx="31" cy="25" r="1.1"/><circle cx="20" cy="26" r=".9"/></g><g fill="#2A2A2A"><circle cx="28" cy="18" r=".4"/><circle cx="44" cy="22" r=".4"/></g>`,
 omelette: B('#FFF6D6') + `<ellipse cx="32" cy="31" rx="23" ry="7" fill="#FFFFFF"/>` + `
  <path d="M12 28c0-8 9-13 20-13s20 5 20 13c-6 3-34 3-40 0z" fill="#F7CF4A"/>
  <path d="M12 28c6 3 34 3 40 0" stroke="#E2AE2C" stroke-width="1.2" fill="none"/>
  <g fill="#E9B23A"><ellipse cx="24" cy="20" rx="2" ry="1"/><ellipse cx="38" cy="19" rx="2.2" ry="1.1"/><ellipse cx="32" cy="24" rx="1.6" ry=".8"/></g>
  <g fill="#4E9A3A"><circle cx="20" cy="24" r=".9"/><circle cx="29" cy="19" r=".8"/><circle cx="43" cy="24" r=".9"/><circle cx="35" cy="26" r=".7"/></g><g fill="#E5402F"><circle cx="26" cy="25.6" r="1"/><circle cx="40" cy="22" r="1"/></g>`,
 avocat: B('#E6F2DC') + sh('#CDE0BC') + `
  <path d="M19 30c-4-6-2-16 3-20 3-2 7-2 9 1 5 5 5 15 1 19-3 4-10 4-13 0z" fill="#3E6B2A"/><path d="M20.5 29c-3-5-1.6-13 2.6-16.6 2.4-1.8 5.6-1.8 7.4.8 4 4.4 4 12.6.8 16-2.6 3.4-8.4 3.4-10.8-.2z" fill="#C9E28A"/>
  <circle cx="26" cy="23" r="4.4" fill="#8A5A2E"/><circle cx="24.6" cy="21.6" r="1.2" fill="#B07A45"/>
  <path d="M35 32c-1-5 1-12 6-14 4-1 7 2 8 6 1 5-2 9-6 10-4 1-7 0-8-2z" fill="#3E6B2A"/><path d="M36.6 31c-.8-4 1-10 5-11.6 3.2-.8 5.8 1.6 6.4 4.8.8 4-1.6 7.2-4.8 8-3.2.8-6 0-6.6-1.2z" fill="#B3D46E"/>`,
 saucisse: B('#F7E2DA') + plate + `
  <path d="M14 26c4-5 14-6 18-2" stroke="#9C3B23" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M15 24.5c4-4 12-5 16-2" stroke="#C25B39" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M30 30c5-4 14-4 19 0" stroke="#A8442A" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M31.6 28.4c4-3 11-3 15.6 0" stroke="#CF6A45" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M19 25l2 3M24 23l1.4 3.4M35 28l1 3.4M41 27.4v3.6" stroke="#6E2414" stroke-width="1" stroke-linecap="round"/>
  <circle cx="47" cy="20" r="3" fill="#F7C93A"/>`,
 semoule: B('#FFF3D8') + `<ellipse cx="32" cy="31" rx="23" ry="7" fill="#FFFFFF"/>` + `
  <path d="M13 29c1-8 9-14 19-14s18 6 19 14c-6 3-32 3-38 0z" fill="#F3D88E"/>
  <g fill="#E8C66A"><circle cx="20" cy="25" r=".6"/><circle cx="25" cy="21" r=".6"/><circle cx="31" cy="19" r=".6"/><circle cx="37" cy="21" r=".6"/><circle cx="43" cy="25" r=".6"/><circle cx="28" cy="25" r=".6"/><circle cx="35" cy="26" r=".6"/></g>
  <g fill="#4E9A3A"><circle cx="22" cy="27" r="1"/><circle cx="33" cy="22" r="1"/><circle cx="40" cy="27" r="1"/><circle cx="27" cy="23" r=".8"/></g><g fill="#E5402F"><rect x="29" y="26" width="2.4" height="2.4" rx=".5"/><rect x="38" y="22" width="2.2" height="2.2" rx=".5"/><rect x="24" y="27.4" width="2" height="2" rx=".5"/></g>
  <path d="M44 18c2-3 6-3 7-1-2 2-5 2-7 1z" fill="#F7E07A"/>`,
 legumineuse: B('#F6E6D6') + `<ellipse cx="32" cy="37" rx="19" ry="2.6" fill="#E6CDB2"/>` + bowl('#FFFFFF', '#E8E2D8') + `
  <path d="M14 22c2-5 9-7 18-7s16 2 18 7z" fill="#B85A2E"/>
  <g fill="#E8B24A"><circle cx="20" cy="20.6" r="1.6"/><circle cx="26" cy="18.6" r="1.6"/><circle cx="32" cy="18" r="1.6"/><circle cx="38" cy="18.6" r="1.6"/><circle cx="44" cy="20.6" r="1.6"/><circle cx="23" cy="21.4" r="1.4"/><circle cx="29" cy="20.8" r="1.4"/><circle cx="35" cy="20.8" r="1.4"/><circle cx="41" cy="21.4" r="1.4"/></g>
  <g fill="#F5D58A"><circle cx="19.6" cy="20" r=".5"/><circle cx="31.6" cy="17.4" r=".5"/><circle cx="43.6" cy="20" r=".5"/></g><path d="M30 14c1-2 3-2.6 4.6-2" stroke="#4E9A3A" stroke-width="1.4" stroke-linecap="round"/>`,
 rouleaux: B('#FFF0D4') + plate + `
  <g transform="rotate(-18 32 26)"><rect x="12" y="20" width="22" height="7" rx="3.5" fill="#E09A45"/><rect x="30" y="24" width="22" height="7" rx="3.5" fill="#D28A36"/>
  <path d="M16 20.6l2 6M21 20.4l2 6.2M26 20.4l2 6.2M34 24.6l2 6M39 24.4l2 6.2M44 24.4l2 6.2" stroke="#B9702A" stroke-width=".9"/>
  <ellipse cx="12.4" cy="23.5" rx="2" ry="3.4" fill="#F7E3BC"/><circle cx="12.4" cy="23.5" r="1.2" fill="#F2909A"/></g>
  <path d="M44 16c2-1 5-1 6 1-2 1.4-4 1-6-1z" fill="#5FAE45"/>`,
 pouletroti: B('#FCE6D2') + `<ellipse cx="32" cy="31" rx="24" ry="7" fill="#FFFFFF"/>` + `
  <path d="M14 26c0-8 8-13 18-13s18 5 18 13c0 4-8 7-18 7s-18-3-18-7z" fill="#C46A2B"/>
  <path d="M18 21c3-4 8-6 14-6" stroke="#E79B5C" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M11 20c-2-3 0-6 3-5 2 0 3 2 4 4l-2 4c-2 0-4-1-5-3zM53 20c2-3 0-6-3-5-2 0-3 2-4 4l2 4c2 0 4-1 5-3z" fill="#B85E22"/>
  <circle cx="10.6" cy="16" r="2" fill="#FFF8EE"/><circle cx="53.4" cy="16" r="2" fill="#FFF8EE"/>
  <g fill="#7E3A12" opacity=".5"><circle cx="26" cy="24" r=".8"/><circle cx="36" cy="22" r=".8"/><circle cx="31" cy="28" r=".8"/><circle cx="42" cy="26" r=".7"/></g>
  <g fill="#4E8A3A"><ellipse cx="16" cy="32" rx="3" ry="1.4"/><ellipse cx="47" cy="32" rx="3" ry="1.4"/></g><circle cx="44" cy="33" r="2" fill="#F7D64A"/>`,
 brochette: B('#F8E4D4') + sh('#E9C9B0') + `
  <path d="M8 34 56 10" stroke="#C99A5B" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="19" cy="28.5" r="5.4" fill="#A0522D"/><circle cx="31" cy="22.5" r="5.4" fill="#9A4B26"/><circle cx="43" cy="16.5" r="5.4" fill="#A0522D"/>
  <path d="M16 26c2-1.4 4-1.6 6-.6M28 20c2-1.4 4-1.6 6-.6M40 14c2-1.4 4-1.6 6-.6" stroke="#D88A55" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  <path d="M15 31c2 1 6 1 8-1M27 25c2 1 6 1 8-1M39 19c2 1 6 1 8-1" stroke="#5E2A12" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <g fill="#F7F1E0"><circle cx="21" cy="27" r=".6"/><circle cx="33" cy="21" r=".6"/><circle cx="45" cy="15" r=".6"/><circle cx="29" cy="24" r=".6"/></g>`,
 wok: B('#FBE9D6') + `<ellipse cx="32" cy="37" rx="19" ry="2.6" fill="#EBD0B0"/>` + bowl('#2F3237', '#55595F') + `
  <path d="M14 22c2-5 9-8 18-8s16 3 18 8z" fill="#FFFFFF"/>
  <g fill="#B5541C"><path d="M18 19c1-2 4-3 6-2 1 1 0 3-2 3.6-2 .4-4 0-4-1.6z"/><path d="M27 16.6c1-2 4-2.4 6-1.6 1.4.8.6 3-1.6 3.6-2 .4-4.4-.2-4.4-2z"/><path d="M36 18c1-2 4-2.6 6-1.6 1.4 1 .6 3-1.6 3.6-2 .4-4.4-.2-4.4-2z"/><path d="M24 20.6c1-1.4 3-2 5-1.4 1 .8.4 2.2-1.2 2.6-1.6.2-3.6-.2-3.8-1.2z"/></g>
  <g fill="#F5E6C4"><circle cx="21" cy="18" r=".5"/><circle cx="30" cy="16" r=".5"/><circle cx="39" cy="17.6" r=".5"/></g><g fill="#5FAE45"><rect x="33" y="20" width="3" height="1" rx=".5"/><rect x="22" y="17" width="2.6" height="1" rx=".5"/></g>
  <path d="M40 10 54 3M42 12 55 6" stroke="#B5783E" stroke-width="1.6" stroke-linecap="round"/>`,
 gratin: B('#FDEBD6') + sh('#EED0B0') + `
  <rect x="10" y="18" width="44" height="16" rx="5" fill="#2F6FB7"/><rect x="7" y="21" width="6" height="4" rx="2" fill="#2F6FB7"/><rect x="51" y="21" width="6" height="4" rx="2" fill="#2F6FB7"/>
  <rect x="13" y="18" width="38" height="10" rx="3" fill="#F2C14E"/>
  <g fill="#C9822F"><ellipse cx="19" cy="21" rx="3" ry="1.6"/><ellipse cx="28" cy="23" rx="3.4" ry="1.8"/><ellipse cx="38" cy="21" rx="3" ry="1.6"/><ellipse cx="45" cy="24" rx="2.6" ry="1.4"/><ellipse cx="33" cy="26" rx="2.4" ry="1.2"/></g>
  <path d="M10 28h44" stroke="#5C93D1" stroke-width="1.2"/><g fill="#4E9A3A"><circle cx="23" cy="25" r=".7"/><circle cx="41" cy="23" r=".7"/></g>`,
 fruitssecs: B('#F4E6D4') + `<ellipse cx="32" cy="37" rx="19" ry="2.6" fill="#E3CDB0"/>` + bowl('#FFFFFF', '#E8E2D8') + `
  <g fill="#B87A3F"><ellipse cx="18" cy="19.6" rx="3" ry="1.8" transform="rotate(-20 18 19.6)"/><ellipse cx="27" cy="17.6" rx="3" ry="1.8" transform="rotate(15 27 17.6)"/><ellipse cx="45" cy="19.6" rx="3" ry="1.8" transform="rotate(25 45 19.6)"/></g>
  <g fill="#D9A866"><circle cx="35" cy="17" r="2.6"/><circle cx="23" cy="21" r="2.2"/><circle cx="40" cy="21" r="2.2"/></g>
  <g fill="#8A5A2E"><path d="M30 19c1-2 4-2 5 0-1 1.6-4 1.6-5 0z"/><path d="M15 21.6c1-1.6 3-1.6 4 0-1 1.4-3 1.4-4 0z"/></g>
  <g fill="#9BC46A"><ellipse cx="31" cy="21.6" rx="1.8" ry="1.1"/><ellipse cx="47" cy="21.6" rx="1.4" ry=".9"/></g>`,
 mousse: B('#F3E6E0') + sh('#E2CDC2') + `
  <path d="M20 10h24l-2 24c0 1.4-1 2.4-2.4 2.4H24.4c-1.4 0-2.4-1-2.4-2.4z" fill="#FFFFFF" fill-opacity=".7" stroke="#C9C4C8" stroke-width="1"/>
  <path d="M21 26h22l-1 8c0 1-1 2-2 2H24c-1 0-2-1-2-2z" fill="#5A2E17"/><path d="M21.4 20h21.2l-.5 6H21.9z" fill="#8C5434"/><path d="M21.8 14h20.4l-.4 6H22.2z" fill="#C79A72"/>
  <path d="M22 14c3-3 6-4 10-4s7 1 10 4z" fill="#FFF8EE"/><circle cx="32" cy="9" r="2" fill="#D83A55"/>
  <g fill="#3A1B0A"><circle cx="27" cy="12.6" r=".5"/><circle cx="36" cy="12" r=".5"/></g>`,
 the: B('#E3F2EA') + sh('#C4DFD0') + `
  <path d="M18 34c-2-6 0-14 8-16h12c8 2 10 10 8 16z" fill="#C0C6CE"/><path d="M20 30h24" stroke="#9AA2AD" stroke-width="1.4"/>
  <path d="M26 18c0-3 3-5 6-5s6 2 6 5z" fill="#D5DAE0"/><circle cx="32" cy="11" r="2" fill="#9AA2AD"/>
  <path d="M46 24c4 0 6-2 8-6 1-2 0-3-1.6-2-2 1.6-3 3.6-6 4.4" stroke="#AEB5BF" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M18 22c-4 0-6 2-6 5s2 5 6 5" stroke="#AEB5BF" stroke-width="2.4" fill="none"/>
  <path d="M30 22c2-2 5-2 6 0-1 2-5 2-6 0z" fill="#4E9A3A"/><path d="M28 25c2-1.6 4-1.6 5 0-1 1.6-4 1.6-5 0z" fill="#5FAE45"/>`
};
module.exports = X;
