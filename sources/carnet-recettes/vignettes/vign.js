// Vignettes illustrées (viewBox 64x44), dessins originaux
const V = {
 poulet: `<rect width="64" height="44" fill="#FCE6D2"/>
  <ellipse cx="32" cy="38" rx="22" ry="3.5" fill="#E9C9AC"/>
  <g transform="rotate(-28 32 22)">
   <rect x="35" y="19" width="15" height="5" rx="2.5" fill="#FFF8EE"/>
   <circle cx="50" cy="18.6" r="3.2" fill="#FFF8EE"/><circle cx="50" cy="24.4" r="3.2" fill="#FFF8EE"/>
   <path d="M14 21.5c0-7 6-11.5 13-11.5 6 0 10 4 11 8.5l1 3-1 3c-1 4.5-5 8.5-11 8.5-7 0-13-4.5-13-11.5z" fill="#C46A2B"/>
   <path d="M18 17c2-3.5 6-5 10-5" stroke="#E79B5C" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  </g>`,
 gateau: `<rect width="64" height="44" fill="#FBE3EA"/>
  <ellipse cx="32" cy="38" rx="21" ry="3.5" fill="#EFC3CF"/>
  <path d="M13 31 46 19v14H13z" fill="#FFF3D9"/>
  <path d="M13 31 46 19v3L13 34z" fill="#F7E2B5"/>
  <rect x="13" y="32" width="33" height="5" rx="1" fill="#C68A4F"/>
  <path d="M46 19v18" stroke="#B57A42" stroke-width="1"/>
  <path d="M14 30.4 46 18.6" stroke="#D83A55" stroke-width="3" stroke-linecap="round"/>
  <circle cx="38" cy="17" r="3" fill="#D83A55"/><circle cx="36.8" cy="16" r="0.8" fill="#FFB3C1"/>`,
 oeuf: `<rect width="64" height="44" fill="#E3EEFA"/>
  <ellipse cx="32" cy="23" rx="22" ry="15" fill="#4A5A70"/><ellipse cx="32" cy="22" rx="20" ry="13" fill="#5E7089"/>
  <path d="M51 16 60 10" stroke="#4A5A70" stroke-width="4" stroke-linecap="round"/>
  <path d="M20 22c-2-6 4-10 9-8 3-3 10-2 11 3 5 1 6 7 2 9 0 4-6 6-10 4-4 3-11 1-11-3-3 0-3-4-1-5z" fill="#FFFFFF"/>
  <circle cx="32" cy="22" r="5" fill="#F6B42A"/><circle cx="30.4" cy="20.4" r="1.4" fill="#FFE29A"/>`,
 chocolat: `<rect width="64" height="44" fill="#F1E3D6"/>
  <ellipse cx="32" cy="35" rx="24" ry="5" fill="#FFFFFF"/><ellipse cx="32" cy="34" rx="20" ry="3.4" fill="#F4ECE4"/>
  <circle cx="21" cy="27" r="7" fill="#6B3A22"/><circle cx="43" cy="27" r="7" fill="#6B3A22"/><circle cx="32" cy="21" r="7.5" fill="#7A4429"/>
  <path d="M26 18.5c3 1.5 6 1.5 11-1M15.5 25c3 1.5 8 1 11-1M37.5 25c3 1.5 8 1 11-1" stroke="#C99872" stroke-width="1.4" stroke-linecap="round" fill="none"/>
  <circle cx="29" cy="18" r="1.3" fill="#A86A45"/><circle cx="18.5" cy="24.5" r="1.1" fill="#8C5434"/><circle cx="40.5" cy="24.5" r="1.1" fill="#8C5434"/>`,
 pain: `<rect width="64" height="44" fill="#FFEFD2"/>
  <ellipse cx="32" cy="38.5" rx="20" ry="3" fill="#EBCFA0"/>
  <path d="M17 37V20c-3-1-4-4-3-6 1-4 6-6 18-6s17 2 18 6c1 2 0 5-3 6v17z" fill="#B9773A"/>
  <path d="M20 35V19c-2-.7-3-2.6-2.4-4 .8-2.6 5-4 14.4-4s13.6 1.4 14.4 4c.6 1.4-.4 3.3-2.4 4v16z" fill="#F2C47E"/>
  <path d="M24 26c4-2 10-2 16 0" stroke="#E2A75A" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <rect x="25" y="28" width="14" height="4" rx="2" fill="#FFE07A"/>`,
 pancakes: `<rect width="64" height="44" fill="#FFF3D3"/>
  <ellipse cx="32" cy="38" rx="21" ry="3.5" fill="#FFFFFF"/>
  <ellipse cx="32" cy="33" rx="17" ry="4" fill="#C98340"/><ellipse cx="32" cy="31.5" rx="17" ry="4" fill="#E8B26A"/>
  <ellipse cx="32" cy="27" rx="16" ry="4" fill="#C98340"/><ellipse cx="32" cy="25.5" rx="16" ry="4" fill="#E8B26A"/>
  <ellipse cx="32" cy="21" rx="15" ry="4" fill="#C98340"/><ellipse cx="32" cy="19.5" rx="15" ry="4" fill="#EDBC76"/>
  <path d="M20 19.5c4-3 20-3 24 0-2 1.5-4 1-5 4-1-2-3-1.5-4 1-1-3-5-2-6-1-2-2-6-1-9-4z" fill="#A85A1E" opacity=".85"/>
  <circle cx="28" cy="16.5" r="2.6" fill="#FFF6C8" stroke="#E7D27A" stroke-width=".8"/><circle cx="35" cy="16" r="2.6" fill="#FFF6C8" stroke="#E7D27A" stroke-width=".8"/>`
};
module.exports=V;
