// Vignettes illustrées, style simple (viewBox 64x44, cadrage 7 4 50 34.4). Dessins originaux.
const V = require('./vign.js');
const X = {
 gateau: `<rect width="64" height="44" fill="#FBE3EA"/>
  <ellipse cx="32" cy="35.5" rx="22" ry="3.4" fill="#EFC3CF"/>
  <path d="M14 18v15a18 4 0 0 0 36 0V18z" fill="#E3A961"/>
  <path d="M14 25.5a18 4 0 0 0 36 0v3a18 4 0 0 1-36 0z" fill="#FFF4DE"/>
  <ellipse cx="32" cy="18" rx="18" ry="4.2" fill="#F7A8B8"/>
  <path d="M14 18c0 2 1 4.5 2.4 4.5S18 20 19.5 20.5s1 4 2.6 4 1.3-3.4 2.9-3.4 1.3 3 3 3 1.3-2.6 2.9-2.6 1.4 3.2 3 3.2 1.4-3.6 3-3.6 1.3 2.6 3 2.6 1.2-3 2.8-3.4 1.7 2.4 3 1.6c1.3-.8 1.8-3 1.8-4.9" fill="#F7A8B8"/>
  <circle cx="32" cy="13.2" r="3.2" fill="#D83A55"/><circle cx="31" cy="12.2" r=".9" fill="#FFB3C1"/>
  <path d="M32.6 10.2c.6-2.4 2.4-3.6 4.4-3.6" stroke="#3E8E36" stroke-width="1.2" stroke-linecap="round" fill="none"/>`,
 poisson: `<rect width="64" height="44" fill="#DDEFF5"/>
  <ellipse cx="32" cy="27" rx="24" ry="10" fill="#FFFFFF"/><ellipse cx="32" cy="27" rx="19" ry="7" fill="#F1F5F8"/>
  <path d="M14 26c4-7 15-9 23-6 3 1 5 3 7 5 2-2 5-4 8-4-1 2-2 4-2 5s1 3 2 5c-3 0-6-2-8-4-2 2-4 4-7 5-8 3-19 1-23-6z" fill="#8FA7B6"/>
  <path d="M22 22.5l3 7M27 21.5l3 8M32 21.5l3 8M37 22.5l2.6 6.6" stroke="#5E7787" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="18.5" cy="25" r="1.3" fill="#1F2D36"/>
  <circle cx="44" cy="31.5" r="4" fill="#F7D64A"/><circle cx="44" cy="31.5" r="2.8" fill="#FBEA97"/><path d="M44 28.7v5.6M41.2 31.5h5.6" stroke="#F7D64A" stroke-width=".7"/>`,
 viande: `<rect width="64" height="44" fill="#F6E0D8"/>
  <ellipse cx="32" cy="35.5" rx="21" ry="3.4" fill="#E8C4B6"/>
  <path d="M15 22c0-6 7-10 15-10 9 0 18 3 19 10 1 6-4 12-15 12-12 0-19-5-19-12z" fill="#E9B7A1"/>
  <path d="M17 22c0-4.8 6-8 13-8 8 0 16 2.6 16.8 8.2.7 5-3.6 9.8-13.3 9.8-10.4 0-16.5-4-16.5-10z" fill="#8E3B2A"/>
  <path d="M22 17l14 13M28 15l15 13M20 23l9 8" stroke="#5E2216" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M44 11c2 1 3 3 2.6 5M46 11.5c-2.4.2-3.8 1.4-4 3" stroke="#4E8A3A" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
 pates: `<rect width="64" height="44" fill="#FFF0CF"/>
  <ellipse cx="32" cy="37" rx="19" ry="2.6" fill="#EAD7A8"/>
  <path d="M12 21h40c0 9-8 15-20 15S12 30 12 21z" fill="#FFFFFF"/><path d="M12 21h40" stroke="#E8E2D2" stroke-width="1.2"/>
  <path d="M15 21c2-6 6-9 11-9 4-2 10-2 13 1 5 0 9 4 10 8z" fill="#F2C14E"/>
  <path d="M18 19c3-3 6-3 9-1s6 2 9-1 7-2 10 1M20 15.5c3-1.5 6-1 8 .5s5 1.5 8-.5" stroke="#D99E22" stroke-width="1.1" stroke-linecap="round" fill="none"/>
  <path d="M25 14c2-3 9-4 13-1 2 2 0 5-5 5s-9-1-8-4z" fill="#D6402F"/>
  <path d="M33 11.6c1.6-1.6 4-1.8 5.2-1-1 1.4-3.2 2-5.2 1z" fill="#3E8E36"/>`,
 riz: `<rect width="64" height="44" fill="#EEF1E4"/>
  <ellipse cx="32" cy="37" rx="18" ry="2.6" fill="#D9DCC9"/>
  <path d="M13 22h38c0 8-8 14-19 14s-19-6-19-14z" fill="#3F6FC7"/><path d="M15.5 27h33" stroke="#7FA3E6" stroke-width="1.6"/>
  <path d="M14 22c0-7 8-11 18-11s18 4 18 11z" fill="#FFFFFF"/>
  <g fill="#E6E6DC"><ellipse cx="22" cy="18" rx="1.4" ry=".7"/><ellipse cx="28" cy="15" rx="1.4" ry=".7" transform="rotate(30 28 15)"/><ellipse cx="35" cy="16" rx="1.4" ry=".7"/><ellipse cx="41" cy="19" rx="1.4" ry=".7" transform="rotate(-30 41 19)"/><ellipse cx="31" cy="19.5" rx="1.4" ry=".7"/><ellipse cx="25" cy="20.5" rx="1.4" ry=".7" transform="rotate(20 25 20.5)"/><ellipse cx="38" cy="13.5" rx="1.2" ry=".6"/></g>
  <path d="M40 9 54 4M42 11 55 7" stroke="#B5783E" stroke-width="1.6" stroke-linecap="round"/>`,
 soupe: `<rect width="64" height="44" fill="#FDEAD2"/>
  <ellipse cx="32" cy="37" rx="19" ry="2.6" fill="#EBCDA6"/>
  <path d="M12 22h40c0 9-8 15-20 15S12 31 12 22z" fill="#D9672E"/><path d="M14 27.5c6 2 30 2 36 0" stroke="#F09A5E" stroke-width="1.4" fill="none"/>
  <ellipse cx="32" cy="22" rx="20" ry="4.6" fill="#B9521F"/><ellipse cx="32" cy="22" rx="18" ry="3.6" fill="#F2A23A"/>
  <g fill="#E07B22"><circle cx="25" cy="22" r="1.2"/><circle cx="36" cy="21" r="1"/><circle cx="31" cy="23.2" r="1"/></g><g fill="#5FA046"><circle cx="28" cy="21" r=".8"/><circle cx="39" cy="22.6" r=".8"/></g>
  <path d="M25 15c-2-2 2-4 0-7M32 15c-2-2 2-4 0-7M39 15c-2-2 2-4 0-7" stroke="#C9A98A" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
 salade: `<rect width="64" height="44" fill="#E4F3DC"/>
  <ellipse cx="32" cy="37" rx="19" ry="2.6" fill="#C9DFBC"/>
  <path d="M12 22h40c0 9-8 15-20 15S12 31 12 22z" fill="#FFFFFF"/><path d="M12 22h40" stroke="#E2E6DE" stroke-width="1.2"/>
  <path d="M14 22c-1-5 4-8 8-6 1-4 7-5 10-2 3-3 9-2 10 2 4-1 8 2 7 6z" fill="#5FAE45"/>
  <path d="M18 21c1-3 4-4 6-3M30 19c1-3 4-4 7-3M40 20c1-2 3-3 5-2" stroke="#3E8E36" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  <circle cx="24" cy="18" r="3" fill="#E5402F"/><circle cx="38" cy="17" r="3" fill="#E5402F"/><circle cx="23.2" cy="17.2" r=".8" fill="#FF9C8C"/>
  <circle cx="31" cy="20" r="2.6" fill="#CFE6A9" stroke="#6AA84F" stroke-width=".9"/><circle cx="44" cy="20.5" r="2.2" fill="#CFE6A9" stroke="#6AA84F" stroke-width=".9"/>`,
 legumes: `<rect width="64" height="44" fill="#E9F3DE"/>
  <ellipse cx="32" cy="36.5" rx="21" ry="3" fill="#CFE0BC"/>
  <path d="M15 34 21 14l6 20z" fill="#F08A24"/><path d="M18 26h4M19.5 21h3" stroke="#C96A12" stroke-width="1" stroke-linecap="round"/><path d="M21 14c-2-4-1-6 0-7M21 14c1-3 3-5 5-5M21 14c-2-2-4-3-6-2" stroke="#4E9A3A" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <ellipse cx="34" cy="25" rx="6.5" ry="10" fill="#6B3A8E" transform="rotate(-18 34 25)"/><path d="M36 15.4c2-1 4-.6 5 1-1.4.4-2.4 1.6-2.6 3-1.2-1.6-2.4-2.4-2.4-4z" fill="#4E9A3A"/><ellipse cx="31.6" cy="23" rx="1.4" ry="4" fill="#9A6BC0" transform="rotate(-18 31.6 23)"/>
  <circle cx="46" cy="29" r="6" fill="#E5402F"/><path d="M43.5 23.6c1.4.8 3.4.8 5 0-1-.6-1.6-1.6-2.5-2-1 .5-1.6 1.4-2.5 2z" fill="#4E9A3A"/><ellipse cx="44" cy="27" rx="1.4" ry="1" fill="#FF9C8C"/>`,
 crepe: `<rect width="64" height="44" fill="#FFF1D4"/>
  <ellipse cx="32" cy="34" rx="23" ry="5" fill="#FFFFFF"/>
  <path d="M14 31 32 11l18 20z" fill="#EDBA6C"/><path d="M14 31 32 11l18 20c-6 2-30 2-36 0z" fill="#E7AE5A"/>
  <path d="M32 11 26 31M32 11l7 20" stroke="#D29545" stroke-width=".9" fill="none"/>
  <g fill="#C98336" opacity=".7"><circle cx="24" cy="25" r="1.3"/><circle cx="33" cy="20" r="1.1"/><circle cx="40" cy="27" r="1.4"/><circle cx="29" cy="28" r="1"/></g>
  <path d="M20 29c3-1 5 1 8-1s6 1 9-1 5 1 8 0" stroke="#7A3E16" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
 boisson: `<rect width="64" height="44" fill="#E3EDFA"/>
  <ellipse cx="32" cy="37.5" rx="12" ry="2.2" fill="#C8D6EA"/>
  <path d="M22 11h20l-3 26H25z" fill="#FFFFFF" fill-opacity=".75" stroke="#B8C7DC" stroke-width="1"/>
  <path d="M23.2 17h17.6l-2.3 19.4H25.5z" fill="#A8693A"/><path d="M23.2 17h17.6l-.4 3.4H23.6z" fill="#F4E3CC"/>
  <rect x="27" y="22" width="5" height="5" rx="1" fill="#FFFFFF" fill-opacity=".55" transform="rotate(12 29.5 24.5)"/><rect x="33" y="25" width="4.4" height="4.4" rx="1" fill="#FFFFFF" fill-opacity=".5" transform="rotate(-10 35 27)"/>
  <path d="M35 6 37.5 30" stroke="#E5402F" stroke-width="2" stroke-linecap="round"/>`,
 biscuit: `<rect width="64" height="44" fill="#F4E8D6"/>
  <ellipse cx="32" cy="36.5" rx="21" ry="3" fill="#E2CFB2"/>
  <circle cx="25" cy="24" r="10" fill="#D49A55"/><circle cx="40" cy="25" r="10" fill="#E0AA66"/>
  <path d="M33 31c3-1 6-1 8-4" stroke="#C48A47" stroke-width="1" fill="none"/>
  <g fill="#5A2E17"><circle cx="21" cy="20" r="1.6"/><circle cx="27" cy="27" r="1.5"/><circle cx="24" cy="24" r="1.2"/><circle cx="29" cy="20" r="1.2"/><circle cx="37" cy="21" r="1.6"/><circle cx="43" cy="27" r="1.6"/><circle cx="40" cy="25" r="1.1"/><circle cx="45" cy="21.5" r="1.2"/><circle cx="36" cy="28" r="1.2"/></g>`,
 sauce: `<rect width="64" height="44" fill="#FCE7DA"/>
  <ellipse cx="32" cy="36.5" rx="18" ry="2.8" fill="#EBCBB7"/>
  <path d="M16 20h32l-2.6 13c-.4 2-2 3-4 3H22.6c-2 0-3.6-1-4-3z" fill="#FFFFFF"/><path d="M17.2 26h29.6" stroke="#ECE6DE" stroke-width="1.2"/>
  <ellipse cx="32" cy="20" rx="16" ry="4" fill="#E9E2D8"/><ellipse cx="32" cy="20" rx="14" ry="3" fill="#E45E2C"/>
  <path d="M26 19.2c2-1 5-1.2 7-.4" stroke="#F79A6A" stroke-width="1" stroke-linecap="round" fill="none"/>
  <path d="M38 19 49 6" stroke="#B9BEC6" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="37" cy="20" rx="3" ry="1.6" fill="#B9BEC6" transform="rotate(-50 37 20)"/>`,
 pizza: `<rect width="64" height="44" fill="#FFE8D4"/>
  <ellipse cx="32" cy="36" rx="20" ry="3" fill="#EFCBAE"/>
  <path d="M12 12c13-4 27-4 40 0L32 36z" fill="#F6C443"/>
  <path d="M12 12c13-4 27-4 40 0l-1.6 3c-12-3.6-25-3.6-36.8 0z" fill="#C9822F"/>
  <g fill="#C8352B"><circle cx="25" cy="17" r="2.6"/><circle cx="38" cy="17.5" r="2.6"/><circle cx="31" cy="24" r="2.4"/><circle cx="33" cy="30" r="1.6"/></g>
  <g fill="#3E8E36"><ellipse cx="30" cy="16" rx="1.6" ry=".9" transform="rotate(20 30 16)"/><ellipse cx="36" cy="23" rx="1.6" ry=".9" transform="rotate(-30 36 23)"/></g>`,
 tajine: `<rect width="64" height="44" fill="#F6E2D2"/>
  <ellipse cx="32" cy="36" rx="23" ry="3" fill="#E5C3A8"/>
  <ellipse cx="32" cy="31" rx="22" ry="5" fill="#9E4A22"/><ellipse cx="32" cy="29.6" rx="22" ry="4.6" fill="#C2622F"/>
  <path d="M15 29c4-10 10-19 17-21 7 2 13 11 17 21-10 3-24 3-34 0z" fill="#C9693A"/>
  <path d="M15 29c10 3 24 3 34 0" stroke="#F0C48A" stroke-width="1.6" fill="none"/>
  <path d="M22 22c6 1.6 14 1.6 20 0M27 15c3.4.8 6.6.8 10 0" stroke="#F0C48A" stroke-width="1.2" fill="none"/>
  <circle cx="32" cy="7.5" r="2.6" fill="#9E4A22"/><path d="M26 25c2-1 4 1 6 0" stroke="#3B8BC2" stroke-width="1" fill="none"/>`,
 fromage: `<rect width="64" height="44" fill="#FFF5D4"/>
  <ellipse cx="32" cy="36" rx="21" ry="3" fill="#EADCA8"/>
  <path d="M13 22 44 12l7 6v15H13z" fill="#F7C93A"/><path d="M13 22 44 12l7 6-38 4z" fill="#FCE07A"/>
  <path d="M13 22h38" stroke="#E2B12C" stroke-width="1"/>
  <g fill="#E2B12C"><ellipse cx="20" cy="27" rx="2" ry="2.4"/><ellipse cx="31" cy="29.5" rx="2.6" ry="2.2"/><ellipse cx="42" cy="26.5" rx="1.8" ry="2"/><ellipse cx="26" cy="25" rx="1.2" ry="1.2"/><ellipse cx="36" cy="18.5" rx="1.6" ry=".9"/><ellipse cx="27" cy="20" rx="1.3" ry=".7"/></g>`,
 fruits: `<rect width="64" height="44" fill="#FDE8E3"/>
  <ellipse cx="32" cy="36.5" rx="21" ry="3" fill="#EFCBC2"/>
  <path d="M14 30c6 5 22 5 32-4 1.4-1.2 2.6-.4 2 1-5 10-26 12-35 6z" fill="#F3CB3A"/><path d="M14 30c6 5 22 5 32-4" stroke="#D9A91E" stroke-width="1" fill="none"/><path d="M46.6 26 49 24" stroke="#6B4A1E" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M27 14c-5-2-11 1-11 7 0 6 4 10 7 10 1.4 0 2.6-.6 4-.6s2.6.6 4 .6c3 0 7-4 7-10 0-6-6-9-11-7z" fill="#E03B33"/>
  <path d="M27 14c0-3 1-5 2-6" stroke="#6B4A1E" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M28.5 11c2-2.4 5-2.6 7-1.6-2 1.8-4.6 2.4-7 1.6z" fill="#4E9A3A"/>
  <ellipse cx="21.6" cy="19" rx="1.8" ry="3" fill="#FF8C83" opacity=".8"/>`,
 flan: `<rect width="64" height="44" fill="#FFF0D9"/>
  <ellipse cx="32" cy="33" rx="22" ry="5" fill="#FFFFFF"/><ellipse cx="32" cy="33" rx="18" ry="3.6" fill="#B5651D" opacity=".85"/>
  <path d="M19 32 22 16h20l3 16z" fill="#F7D57A"/><path d="M19 32c6 2 20 2 26 0" stroke="#E7BC52" stroke-width="1" fill="none"/>
  <ellipse cx="32" cy="16" rx="10" ry="2.6" fill="#9C4E12"/>
  <path d="M22.4 16.6c.2 3 1.2 4 1.2 6M28 18c0 2 .8 3 .8 4.6M37 18c0 2.4 1 3 1 5M41.4 16.8c0 2.6.8 3.6.8 5" stroke="#9C4E12" stroke-width="1.6" stroke-linecap="round"/>`
};
module.exports = Object.assign({}, V, X);
