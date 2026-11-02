/*!
 * vitrine.js · VITRINE for Shopify themes · Apache-2.0 · Copyright 2026 Piotr Filipecki
 * https://github.com/PiotrekFilipecki/vitrine · <vitrine-shader> effect="dither|halftone|mesh|paper|glass|lens"
 * Powered by Paper Shaders (https://shaders.paper.design), @paper-design/shaders 0.0.82, Apache-2.0.
 * NOTICE of Paper Shaders, reproduced as required by its licence:
 * Powered by Paper Shaders:
 * https://shaders.paper.design
 */
var _i=Object.defineProperty;var x=(t,e,i)=>()=>{if(i)throw i[0];try{return t&&(e=t(t=0)),e}catch(r){throw i=[r],r}};var z=(t,e)=>{for(var i in e)_i(t,i,{get:e[i],enumerable:!0})};var st,lt=x(()=>{"use strict";st="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="});function Ce(t){if(t.naturalWidth<1024&&t.naturalHeight<1024){if(t.naturalWidth<1||t.naturalHeight<1)return;let e=t.naturalWidth/t.naturalHeight;t.width=Math.round(e>1?1024*e:1024),t.height=Math.round(e>1?1024:1024/e)}}function ut(t){try{return new URL(t,location.href).origin!==location.origin}catch{return!1}}function Se(t){let e=ye.get(t);return e||(e=new Promise((i,r)=>{let o=new Image;ut(t)&&(o.crossOrigin="anonymous"),o.onload=()=>{o.decode().catch(()=>{}).then(()=>{Ce(o),i(o)})},o.onerror=()=>{ye.delete(t),r(new $(ut(t)?"cors":"error",`texture failed to load: ${t.slice(0,200)}`))},o.src=t}),ye.set(t,e)),e}function ct(){return Ee||(Ee=Se(st)),Ee}function ft(t){return t.complete?Promise.resolve(t.naturalWidth>0):new Promise(e=>{let i=n=>{t.removeEventListener("load",r),t.removeEventListener("error",o),e(n)},r=()=>i(!0),o=()=>i(!1);t.addEventListener("load",r),t.addEventListener("error",o)})}function dt(){if(typeof document>"u")return!1;let e=document.createElement("canvas").getContext("webgl2");return e?(e.getExtension("WEBGL_lose_context")?.loseContext(),!0):!1}function D(){return new Promise(t=>requestAnimationFrame(()=>requestAnimationFrame(()=>t())))}var $,ye,Ee,ee=x(()=>{"use strict";lt();$=class extends Error{constructor(i,r){super(r);this.kind=i}kind},ye=new Map;Ee=null});function _(t){if(Array.isArray(t))return t.length===4?t:t.length===3?[...t,1]:W;if(typeof t!="string")return W;let e,i,r,o=1;if(t.startsWith("#"))[e,i,r,o]=Ki(t);else if(t.startsWith("rgb")){let n=qi(t);if(n===null)return W;[e,i,r,o]=n}else if(t.startsWith("hsl")){let n=Xi(t);if(n===null)return W;[e,i,r,o]=Ji(n)}else return console.error("Unsupported color format",t),W;return[ce(e,0,1),ce(i,0,1),ce(r,0,1),ce(o,0,1)]}function Ki(t){if(t=t.replace(/^#/,""),(t.length===3||t.length===4)&&(t=t.split("").map(n=>n+n).join("")),t.length===6&&(t=t+"ff"),!/^[0-9a-f]{8}$/i.test(t))return console.warn("Invalid hex color"),W;let e=parseInt(t.slice(0,2),16)/255,i=parseInt(t.slice(2,4),16)/255,r=parseInt(t.slice(4,6),16)/255,o=parseInt(t.slice(6,8),16)/255;return[e,i,r,o]}function qi(t){let e=t.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);return e?[parseInt(e[1]??"0")/255,parseInt(e[2]??"0")/255,parseInt(e[3]??"0")/255,e[4]===void 0?1:parseFloat(e[4])]:null}function Xi(t){let e=t.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);return e?[parseInt(e[1]??"0"),parseInt(e[2]??"0"),parseInt(e[3]??"0"),e[4]===void 0?1:parseFloat(e[4])]:null}function Ji(t){let[e,i,r,o]=t,n=e/360,a=i/100,l=r/100,d,m,s;if(i===0)d=m=s=l;else{let u=(h,A,g)=>(g<0&&(g+=1),g>1&&(g-=1),g<.16666666666666666?h+(A-h)*6*g:g<.5?A:g<.6666666666666666?h+(A-h)*(.6666666666666666-g)*6:h),b=l<.5?l*(1+a):l+a-l*a,w=2*l-b;d=u(w,b,n+1/3),m=u(w,b,n),s=u(w,b,n-1/3)}return[d,m,s,o]}var ce,W,Y=x(()=>{"use strict";ce=(t,e,i)=>Math.min(Math.max(t,e),i),W=[.5,.5,.5,1]});var xt,At=x(()=>{"use strict";xt={none:0,contain:1,cover:2}});var k,H,F,bt,O=x(()=>{"use strict";k=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,H=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,F=`
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`,bt=`
  vec2 hash22(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p.yx + 19.19);
    return fract(vec2(p.x * p.y, p.x + p.y));
  }
`});var _e,ke,wt=x(()=>{"use strict";O();_e=`#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform vec4 u_colorHighlight;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_type;
uniform float u_pxSize;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_colorSteps;

out vec4 fragColor;


${F}
${k}

float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.0001;

  float left   = smoothstep(-pad.x, -pad.x + aa, uv.x);
  float right  = smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x);
  float bottom = smoothstep(-pad.y, -pad.y + aa, uv.y);
  float top    = smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);

  return left * right * bottom * top;
}

vec2 getImageUV(vec2 uv) {
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  float r = u_rotation * PI / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  vec2 imageUV = uv;
  imageUV *= imageBoxScale;
  imageUV += boxOrigin * (imageBoxScale - 1.);
  imageUV += graphicOffset;
  imageUV /= u_scale;
  imageUV.x *= u_imageAspectRatio;
  imageUV = graphicRotation * imageUV;
  imageUV.x /= u_imageAspectRatio;

  imageUV += .5;
  imageUV.y = 1. - imageUV.y;

  return imageUV;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
0, 8, 2, 10,
12, 4, 14, 6,
3, 11, 1, 9,
15, 7, 13, 5
);

const int bayer8x8[64] = int[64](
0, 32, 8, 40, 2, 34, 10, 42,
48, 16, 56, 24, 50, 18, 58, 26,
12, 44, 4, 36, 14, 46, 6, 38,
60, 28, 52, 20, 62, 30, 54, 22,
3, 35, 11, 43, 1, 33, 9, 41,
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(fract(uv / float(size)) * float(size));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}


void main() {

  float pxSize = u_pxSize * u_pixelRatio;
  vec2 pxSizeUV = gl_FragCoord.xy - .5 * u_resolution;
  pxSizeUV /= pxSize;
  vec2 canvasPixelizedUV = (floor(pxSizeUV) + .5) * pxSize;
  vec2 normalizedUV = canvasPixelizedUV / u_resolution;

  vec2 imageUV = getImageUV(normalizedUV);
  vec2 ditheringNoiseUV = canvasPixelizedUV;
  vec4 image = texture(u_image, imageUV);
  float frame = getUvFrame(imageUV, pxSize / u_resolution);

  int type = int(floor(u_type));
  float dithering = 0.0;

  float lum = dot(vec3(.2126, .7152, .0722), image.rgb);
  lum = u_inverted ? (1. - lum) : lum;

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoiseUV), lum);
    } break;
    case 2:
    dithering = getBayerValue(pxSizeUV, 2);
    break;
    case 3:
    dithering = getBayerValue(pxSizeUV, 4);
    break;
    default :
    dithering = getBayerValue(pxSizeUV, 8);
    break;
  }

  float colorSteps = max(floor(u_colorSteps), 1.);
  vec3 color = vec3(0.0);
  float opacity = 1.;

  dithering -= .5;
  float brightness = clamp(lum + dithering / colorSteps, 0.0, 1.0);
  brightness = mix(0.0, brightness, frame);
  brightness = mix(0.0, brightness, image.a);
  float quantLum = floor(brightness * colorSteps + 0.5) / colorSteps;
  quantLum = mix(0.0, quantLum, frame);

  if (u_originalColors == true) {
    vec3 normColor = image.rgb / max(lum, 0.001);
    color = normColor * quantLum;

    float quantAlpha = floor(image.a * colorSteps + 0.5) / colorSteps;
    opacity = mix(quantLum, 1., quantAlpha);
  } else {
    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;
    vec3 hlColor = u_colorHighlight.rgb * u_colorHighlight.a;
    float hlOpacity = u_colorHighlight.a;

    fgColor = mix(fgColor, hlColor, step(1.02 - .02 * u_colorSteps, brightness));
    fgOpacity = mix(fgOpacity, hlOpacity, step(1.02 - .02 * u_colorSteps, brightness));

    color = fgColor * quantLum;
    opacity = fgOpacity * quantLum;
    color += bgColor * (1.0 - opacity);
    opacity += bgOpacity * (1.0 - opacity);
  }

  fragColor = vec4(color, opacity);
}
`,ke={random:1,"2x2":2,"4x4":3,"8x8":4}});var Et,yt=x(()=>{Et={effect:"dither",shader:"image-dithering",paperShaders:"0.0.82",presets:{default:{name:"Default",source:"@paper-design/shaders-react 0.0.82, image-dithering.tsx defaultPreset (1:1)",params:{fit:"cover",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:0,frame:0,colorFront:"#94ffaf",colorBack:"#000c38",colorHighlight:"#eaff94",type:"8x8",size:2,colorSteps:2,originalColors:!1,inverted:!1}},newsprint:{name:"Newsprint",source:"VITRINE P4: tuned by eye on NIWWTS No.06 renders of the element (sheets in docs/media/p4-tuning-*.png), niwwts-aesthetic as arbiter; 3 steps keep the artwork on the tee legible, 2 flattened it. Q0: whitePoint 0.9 (VITRINE-only option) prints the cream mockup ground (luminance 0.927) as clean paper: background raster 23.05 % \u2192 0.22 % on the 12 mockups (docs/media/q0-dither-variants.png)",params:{fit:"cover",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:0,frame:0,colorFront:"#f1ece2",colorBack:"#151311",colorHighlight:"#f1ece2",type:"8x8",size:2,colorSteps:3,originalColors:!1,inverted:!1,whitePoint:.9}}}}});function Re(t){if(t===null||t.trim()==="")return{};let e;try{e=JSON.parse(t)}catch{return null}if(e===null||typeof e!="object"||Array.isArray(e))return null;let i={};for(let[r,o]of Object.entries(e))Zi(o)&&(i[r]=o);return i}function Zi(t){return typeof t=="string"||typeof t=="boolean"?!0:typeof t=="number"?Number.isFinite(t):Array.isArray(t)?t.every(e=>typeof e=="string"):!1}function Ue(t,e,i,r){let o=t.default?.params??{},n=t[e],a={...o,...n?.params??{},...i};if(r!==null&&r.trim()!==""){let l=Number(r);Number.isFinite(l)&&(a.speed=l)}return{params:a,presetId:n?e:"default",presetKnown:!!n}}function fe(t){return Array.isArray(t)?`[${t.map(fe).join(",")}]`:t!==null&&typeof t=="object"?`{${Object.keys(t).sort().map(i=>`${JSON.stringify(i)}:${fe(t[i])}`).join(",")}}`:JSON.stringify(t)}function Pe(t){let e=fe(t),i=2166136261;for(let r=0;r<e.length;r++)i^=e.charCodeAt(r),i=Math.imul(i,16777619)>>>0;return i.toString(16).padStart(8,"0")}function f(t,e){if(typeof t=="number")return t;if(typeof t=="string"&&t.trim()!==""){let i=Number(t);if(Number.isFinite(i))return i}return e}function L(t,e){return typeof t=="boolean"?t:t==="true"?!0:t==="false"?!1:e}function p(t,e){return typeof t=="string"?t:e}function Fe(t,e){return Array.isArray(t)&&t.length>0?t:e}var P=x(()=>{"use strict"});function R(t,e){let i=p(t.fit,p(e.fit,"contain"));return{u_fit:xt[i==="none"||i==="cover"||i==="contain"?i:"contain"],u_rotation:f(t.rotation,f(e.rotation,0)),u_scale:f(t.scale,f(e.scale,1)),u_offsetX:f(t.offsetX,f(e.offsetX,0)),u_offsetY:f(t.offsetY,f(e.offsetY,0)),u_originX:f(t.originX,f(e.originX,.5)),u_originY:f(t.originY,f(e.originY,.5)),u_worldWidth:f(t.worldWidth,f(e.worldWidth,0)),u_worldHeight:f(t.worldHeight,f(e.worldHeight,0))}}var Q=x(()=>{"use strict";At();P()});var Mt={};z(Mt,{default:()=>tr,patchWhitePoint:()=>Bt,whitePointOf:()=>De});function $i(t){return t in ke?t:p(V.type,"8x8")}function Bt(t){if(t.split(Ve).length!==2||t.split(Ie).length!==2)throw new Error("image-dithering source changed upstream: whitePoint patch anchors not found");return t.replace(Ie,`${Ie}
uniform float u_vitrineWhitePoint;`).replace(Ve,`${Ve}
  lum = min(lum / u_vitrineWhitePoint, 1.);`)}function De(t){let e=t.whitePoint;return typeof e=="number"&&Number.isFinite(e)&&e>0&&e<1?e:null}var St,V,Ve,Ie,Ct,er,tr,_t=x(()=>{"use strict";Y();wt();yt();P();Q();St=Et,V=St.presets.default.params;Ve="float lum = dot(vec3(.2126, .7152, .0722), image.rgb);",Ie="uniform float u_colorSteps;";Ct=null;er={effect:"dither",shader:"image-dithering",fragmentShader:_e,image:"required",mipmaps:[],presets:St.presets,variant(t){return De(t)===null?null:(Ct??=Bt(_e),{key:"dither+whitePoint",fragmentShader:Ct})},toUniforms(t,{image:e}){let i={u_image:e,u_colorFront:_(p(t.colorFront,p(V.colorFront,""))),u_colorBack:_(p(t.colorBack,p(V.colorBack,""))),u_colorHighlight:_(p(t.colorHighlight,p(V.colorHighlight,""))),u_type:ke[$i(p(t.type,p(V.type,"8x8")))],u_pxSize:f(t.size,f(V.size,2)),u_colorSteps:f(t.colorSteps,f(V.colorSteps,2)),u_originalColors:L(t.originalColors,L(V.originalColors,!1)),u_inverted:L(t.inverted,L(V.inverted,!1)),...R(t,V)},r=De(t);return r===null?i:{...i,u_vitrineWhitePoint:r}}},tr=er});var kt,Te,Rt=x(()=>{"use strict";O();kt=`#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colorC;
uniform vec4 u_colorM;
uniform vec4 u_colorY;
uniform vec4 u_colorK;
uniform float u_size;
uniform float u_contrast;
uniform float u_grainSize;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_gridNoise;
uniform float u_softness;
uniform float u_floodC;
uniform float u_floodM;
uniform float u_floodY;
uniform float u_floodK;
uniform float u_gainC;
uniform float u_gainM;
uniform float u_gainY;
uniform float u_gainK;
uniform float u_type;
uniform sampler2D u_noiseTexture;

in vec2 v_imageUV;
out vec4 fragColor;

const float shiftC = -.5;
const float shiftM = -.25;
const float shiftY = .2;
const float shiftK = 0.;

// Precomputed sin/cos for rotation angles (15\xB0, 75\xB0, 0\xB0, 45\xB0)
const float cosC = 0.9659258;  const float sinC = 0.2588190;   // 15\xB0
const float cosM = 0.2588190;  const float sinM = 0.9659258;   // 75\xB0
const float cosY = 1.0;        const float sinY = 0.0;         // 0\xB0
const float cosK = 0.7071068;  const float sinK = 0.7071068;   // 45\xB0

${k}

vec2 randomRG(vec2 p) {
  vec2 uv = floor(p) / 100. + .5;
  return texture(u_noiseTexture, fract(uv)).rg;
}
vec3 hash23(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.3183099, 0.3678794, 0.3141592)) + 0.1;
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3(p3.x * p3.y, p3.y * p3.z, p3.z * p3.x));
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

vec3 valueNoise3(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec3 a = hash23(i);
  vec3 b = hash23(i + vec2(1.0, 0.0));
  vec3 c = hash23(i + vec2(0.0, 1.0));
  vec3 d = hash23(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec3 x1 = mix(a, b, u.x);
  vec3 x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float getUvFrame(vec2 uv, vec2 pad) {
  float left   = smoothstep(-pad.x, 0., uv.x);
  float right  = smoothstep(1. + pad.x, 1., uv.x);
  float bottom = smoothstep(-pad.y, 0., uv.y);
  float top    = smoothstep(1. + pad.y, 1., uv.y);

  return left * right * bottom * top;
}

vec4 RGBAtoCMYK(vec4 rgba) {
  float k = 1. - max(max(rgba.r, rgba.g), rgba.b);
  float denom = 1. - k;
  vec3 cmy = vec3(0.);
  if (denom > 1e-5) {
    cmy = (1. - rgba.rgb - vec3(k)) / denom;
  }
  return vec4(cmy, k) * rgba.a;
}

vec3 applyContrast(vec3 rgb) {
  return clamp((rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
}

// Single-component CMYK extractors with contrast built-in, alpha-aware
float getCyan(vec4 rgba) {
  vec3 c = clamp((rgba.rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  float maxRGB = max(max(c.r, c.g), c.b);
  return (maxRGB > 1e-5 ? (maxRGB - c.r) / maxRGB : 0.) * rgba.a;
}
float getMagenta(vec4 rgba) {
  vec3 c = clamp((rgba.rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  float maxRGB = max(max(c.r, c.g), c.b);
  return (maxRGB > 1e-5 ? (maxRGB - c.g) / maxRGB : 0.) * rgba.a;
}
float getYellow(vec4 rgba) {
  vec3 c = clamp((rgba.rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  float maxRGB = max(max(c.r, c.g), c.b);
  return (maxRGB > 1e-5 ? (maxRGB - c.b) / maxRGB : 0.) * rgba.a;
}
float getBlack(vec4 rgba) {
  vec3 c = clamp((rgba.rgb - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  return (1. - max(max(c.r, c.g), c.b)) * rgba.a;
}

vec2 cellCenterPos(vec2 uv, vec2 cellOffset, float channelIdx) {
  vec2 cellCenter = floor(uv) + .5 + cellOffset;
  return cellCenter + (randomRG(cellCenter + channelIdx * 50.) - .5) * u_gridNoise;
}

vec2 gridToImageUV(vec2 cellCenter, float cosA, float sinA, float shift, vec2 pad) {
  vec2 uvGrid = mat2(cosA, -sinA, sinA, cosA) * (cellCenter - shift);
  return uvGrid * pad + 0.5;
}

void colorMask(vec2 pos, vec2 cellCenter, float rad, float transparency, float grain, float channelAddon, float channelgain, float generalComp, bool isJoined, inout float outMask) {
  float dist = length(pos - cellCenter);

  float radius = rad;
  radius *= (1. + generalComp);
  radius += (.15 + channelgain * radius);
  radius = max(0., radius);
  radius = mix(0., radius, transparency);
  radius += channelAddon;
  radius *= (1. - grain);

  float mask = 1. - sst(0., radius, dist);
  if (isJoined) {
    // ink or sharp (joined)
    mask = pow(mask, 1.2);
  } else {
    // dots (separate)
    mask = sst(.5 - .5 * u_softness, .51 + .49 * u_softness, mask);
  }

  mask *= mix(1., mix(.5, 1., 1.5 * radius), u_softness);
  outMask += mask;
}

vec3 applyInk(vec3 paper, vec3 inkColor, float cov) {
  vec3 inkEffect = mix(vec3(1.0), inkColor, clamp(cov, 0.0, 1.0));
  return paper * inkEffect;
}

void main() {
  vec2 uv = v_imageUV;

  float cellsPerSide = mix(400.0, 7.0, pow(u_size, 0.7));
  float cellSizeY = 1.0 / cellsPerSide;
  vec2 pad = cellSizeY * vec2(1.0 / u_imageAspectRatio, 1.0);
  vec2 uvGrid = (uv - .5) / pad;
  float insideImageBox = getUvFrame(uv, pad);

  float generalComp = .1 * u_softness + .1 * u_gridNoise + .1 * (1. - step(0.5, u_type)) * (1.5 - u_softness);

  vec2 uvC = mat2(cosC, sinC, -sinC, cosC) * uvGrid + shiftC;
  vec2 uvM = mat2(cosM, sinM, -sinM, cosM) * uvGrid + shiftM;
  vec2 uvY = mat2(cosY, sinY, -sinY, cosY) * uvGrid + shiftY;
  vec2 uvK = mat2(cosK, sinK, -sinK, cosK) * uvGrid + shiftK;

  vec2 grainSize = mix(2000., 200., u_grainSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainUV = (v_imageUV - .5) * grainSize + .5;
  // shared by the grain mixer and the grain overlay, skip it when neither is on
  vec3 noiseValues = vec3(0.);
  if (u_grainMixer > 0. || u_grainOverlay > 0.) {
    noiseValues = valueNoise3(grainUV);
  }
  float grain = sst(.55, 1., noiseValues.r);
  grain *= u_grainMixer;

  vec4 outMask = vec4(0.);
  bool isJoined = u_type > 0.5;

  if (u_type < 1.5) {
    // dots or ink: per-cell color sampling
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cellOffset = vec2(float(dx), float(dy));

        vec2 cellCenterC = cellCenterPos(uvC, cellOffset, 0.);
        vec4 texC = texture(u_image, gridToImageUV(cellCenterC, cosC, sinC, shiftC, pad));
        colorMask(uvC, cellCenterC, getCyan(texC), insideImageBox * texC.a, grain, u_floodC, u_gainC, generalComp, isJoined, outMask[0]);

        vec2 cellCenterM = cellCenterPos(uvM, cellOffset, 1.);
        vec4 texM = texture(u_image, gridToImageUV(cellCenterM, cosM, sinM, shiftM, pad));
        colorMask(uvM, cellCenterM, getMagenta(texM), insideImageBox * texM.a, grain, u_floodM, u_gainM, generalComp, isJoined, outMask[1]);

        vec2 cellCenterY = cellCenterPos(uvY, cellOffset, 2.);
        vec4 texY = texture(u_image, gridToImageUV(cellCenterY, cosY, sinY, shiftY, pad));
        colorMask(uvY, cellCenterY, getYellow(texY), insideImageBox * texY.a, grain, u_floodY, u_gainY, generalComp, isJoined, outMask[2]);

        vec2 cellCenterK = cellCenterPos(uvK, cellOffset, 3.);
        vec4 texK = texture(u_image, gridToImageUV(cellCenterK, cosK, sinK, shiftK, pad));
        colorMask(uvK, cellCenterK, getBlack(texK), insideImageBox * texK.a, grain, u_floodK, u_gainK, generalComp, isJoined, outMask[3]);
      }
    }
  } else {
    // sharp: direct px color sampling
    vec4 tex = texture(u_image, uv);
    tex.rgb = applyContrast(tex.rgb);
    insideImageBox *= tex.a;
    vec4 cmykOriginal = RGBAtoCMYK(tex);
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cellOffset = vec2(float(dx), float(dy));

        colorMask(uvC, cellCenterPos(uvC, cellOffset, 0.), cmykOriginal.x, insideImageBox, grain, u_floodC, u_gainC, generalComp, isJoined, outMask[0]);
        colorMask(uvM, cellCenterPos(uvM, cellOffset, 1.), cmykOriginal.y, insideImageBox, grain, u_floodM, u_gainM, generalComp, isJoined, outMask[1]);
        colorMask(uvY, cellCenterPos(uvY, cellOffset, 2.), cmykOriginal.z, insideImageBox, grain, u_floodY, u_gainY, generalComp, isJoined, outMask[2]);
        colorMask(uvK, cellCenterPos(uvK, cellOffset, 3.), cmykOriginal.w, insideImageBox, grain, u_floodK, u_gainK, generalComp, isJoined, outMask[3]);
      }
    }
  }

  float shape;

  float C = outMask[0];
  float M = outMask[1];
  float Y = outMask[2];
  float K = outMask[3];

  if (isJoined) {
    // ink or sharp: apply threshold for joined dots
    float th = .5;
    float sLeft = th * u_softness;
    float sRight = (1. - th) * u_softness + .01;
    C = smoothstep(th - sLeft - fwidth(C), th + sRight, C);
    M = smoothstep(th - sLeft - fwidth(M), th + sRight, M);
    Y = smoothstep(th - sLeft - fwidth(Y), th + sRight, Y);
    K = smoothstep(th - sLeft - fwidth(K), th + sRight, K);
  }

  C *= u_colorC.a;
  M *= u_colorM.a;
  Y *= u_colorY.a;
  K *= u_colorK.a;

  vec3 ink = vec3(1.);
  ink = applyInk(ink, u_colorK.rgb, K);
  ink = applyInk(ink, u_colorC.rgb, C);
  ink = applyInk(ink, u_colorM.rgb, M);
  ink = applyInk(ink, u_colorY.rgb, Y);

  shape = clamp(max(max(C, M), max(Y, K)), 0., 1.);

  vec3 color = u_colorBack.rgb * u_colorBack.a;

  float opacity = u_colorBack.a;
  color = mix(color, ink, shape);
  opacity += shape;
  opacity = clamp(opacity, 0., 1.);

  float grainOverlay = mix(noiseValues.g, noiseValues.b, .5);
  grainOverlay = pow(grainOverlay, 1.3);

  float grainOverlayV = grainOverlay * 2. - 1.;
  vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
  float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
  grainOverlayStrength = pow(grainOverlayStrength, .8);
  color = mix(color, grainOverlayColor, .5 * grainOverlayStrength);

  opacity += .5 * grainOverlayStrength;
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`,Te={dots:0,ink:1,sharp:2}});var Pt,Ut=x(()=>{Pt={effect:"halftone",shader:"halftone-cmyk",paperShaders:"0.0.82",presets:{default:{name:"Default",source:"@paper-design/shaders-react 0.0.82, halftone-cmyk.tsx defaultPreset (1:1)",params:{fit:"cover",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:0,frame:0,colorBack:"#fbfaf5",colorC:"#00b4ff",colorM:"#fc519f",colorY:"#ffd800",colorK:"#231f20",size:.2,contrast:1,softness:1,grainSize:.5,grainMixer:0,grainOverlay:0,gridNoise:.2,floodC:.15,floodM:0,floodY:0,floodK:0,gainC:.3,gainM:0,gainY:.2,gainK:0,type:"ink"}},riso:{name:"Riso 2-tone",source:"VITRINE P4: tuned by eye on NIWWTS No.06 renders of the element (sheets in docs/media/p4-tuning-*.png), niwwts-aesthetic as arbiter; cyan channel off: the blue speckle it put on the paper read as noise, two inks (orange + ink) read as riso",params:{fit:"cover",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:0,frame:0,colorBack:"#f1ece2",colorC:"#3a4df000",colorM:"#f2861e",colorY:"#f1ece200",colorK:"#151311",size:.4,contrast:1.1,softness:.3,grainSize:.4,grainMixer:.1,grainOverlay:.15,gridNoise:.3,floodC:0,floodM:0,floodY:0,floodK:0,gainC:0,gainM:0,gainY:0,gainK:0,type:"ink"}}}}});function Ft(){if(typeof window>"u")return;let t=new Image;return t.src=rr,t}var rr,Vt=x(()=>{"use strict";rr="data:image/png;base64,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"});function me(){if(!de){let t=Ft();if(!t)return Promise.reject(new Error("noise texture needs a window"));de=t.decode().then(()=>(Ce(t),t)).catch(e=>{throw de=null,e})}return de}var de,Le=x(()=>{"use strict";Vt();ee();de=null});var Dt={};z(Dt,{default:()=>ar});function or(t){return t in Te?t:p(oe.type,"ink")}var It,oe,S,re,nr,ar,Tt=x(()=>{"use strict";Y();Rt();Ut();P();Le();Q();It=Pt,oe=It.presets.default.params,S=(t,e)=>f(t[e],f(oe[e],0)),re=(t,e)=>_(p(t[e],p(oe[e],"")));nr={effect:"halftone",shader:"halftone-cmyk",fragmentShader:kt,image:"required",loadNoise:me,mipmaps:[],presets:It.presets,toUniforms(t,{image:e,noise:i}){return{u_image:e,u_noiseTexture:i,u_colorBack:re(t,"colorBack"),u_colorC:re(t,"colorC"),u_colorM:re(t,"colorM"),u_colorY:re(t,"colorY"),u_colorK:re(t,"colorK"),u_size:S(t,"size"),u_contrast:S(t,"contrast"),u_softness:S(t,"softness"),u_grainSize:S(t,"grainSize"),u_grainMixer:S(t,"grainMixer"),u_grainOverlay:S(t,"grainOverlay"),u_gridNoise:S(t,"gridNoise"),u_floodC:S(t,"floodC"),u_floodM:S(t,"floodM"),u_floodY:S(t,"floodY"),u_floodK:S(t,"floodK"),u_gainC:S(t,"gainC"),u_gainM:S(t,"gainM"),u_gainY:S(t,"gainY"),u_gainK:S(t,"gainK"),u_type:Te[or(p(t.type,p(oe.type,"ink")))],...R(t,oe)}}},ar=nr});var Lt,Ot,Qt=x(()=>{"use strict";O();Lt={maxColorCount:10},Ot=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec4 u_colors[${Lt.maxColorCount}];
uniform float u_colorsCount;

uniform float u_distortion;
uniform float u_swirl;
uniform float u_grainMixer;
uniform float u_grainOverlay;

in vec2 v_objectUV;
out vec4 fragColor;

${k}
${H}
${F}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float noise(vec2 n, vec2 seedOffset) {
  return valueNoise(n + seedOffset);
}

vec2 getPosition(int i, float t) {
  float a = float(i) * .37;
  float b = .6 + fract(float(i) / 3.) * .9;
  float c = .8 + fract(float(i + 1) / 4.);

  float x = sin(t * b + a);
  float y = cos(t * c + a * 1.5);

  return .5 + .5 * vec2(x, y);
}

void main() {
  vec2 uv = v_objectUV;
  uv += .5;
  vec2 grainUV = uv * 1000.;

  float mixerGrain = 0.;
  if (u_grainMixer > 0.) {
    mixerGrain = .4 * u_grainMixer * (noise(grainUV, vec2(0.)) - .5);
  }

  const float firstFrameOffset = 41.5;
  float t = .5 * (u_time + firstFrameOffset);

  float radius = smoothstep(0., 1., length(uv - .5));
  float center = 1. - radius;
  for (float i = 1.; i <= 2.; i++) {
    uv.x += u_distortion * center / i * sin(t + i * .4 * smoothstep(.0, 1., uv.y)) * cos(.2 * t + i * 2.4 * smoothstep(.0, 1., uv.y));
    uv.y += u_distortion * center / i * cos(t + i * 2. * smoothstep(.0, 1., uv.x));
  }

  vec2 uvRotated = uv;
  uvRotated -= vec2(.5);
  float angle = 3. * u_swirl * radius;
  uvRotated = rotate(uvRotated, -angle);
  uvRotated += vec2(.5);

  vec3 color = vec3(0.);
  float opacity = 0.;
  float totalWeight = 0.;

  for (int i = 0; i < ${Lt.maxColorCount}; i++) {
    if (i >= int(u_colorsCount)) break;

    vec2 pos = getPosition(i, t) + mixerGrain;
    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
    float opacityFraction = u_colors[i].a;

    float dist = length(uvRotated - pos);

    dist = pow(dist, 3.5);
    float weight = 1. / (dist + 1e-3);
    color += colorFraction * weight;
    opacity += opacityFraction * weight;
    totalWeight += weight;
  }

  color /= max(1e-4, totalWeight);
  opacity /= max(1e-4, totalWeight);

  if (u_grainOverlay > 0.) {
    float grainOverlay = valueNoise(rotate(grainUV, 1.) + vec2(3.));
    grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
    grainOverlay = pow(grainOverlay, 1.3);

    float grainOverlayV = grainOverlay * 2. - 1.;
    vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
    float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
    grainOverlayStrength = pow(grainOverlayStrength, .8);
    color = mix(color, grainOverlayColor, .35 * grainOverlayStrength);

    opacity += .5 * grainOverlayStrength;
  }
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`});var Gt,zt=x(()=>{Gt={effect:"mesh",shader:"mesh-gradient",paperShaders:"0.0.82",presets:{default:{name:"Default",source:"@paper-design/shaders-react 0.0.82, mesh-gradient.tsx defaultPreset (1:1)",params:{fit:"contain",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:1,frame:0,colors:["#e0eaff","#241d9a","#f75092","#9f50d3"],distortion:.8,swirl:.1,grainMixer:0,grainOverlay:0}},"drop-night":{name:"Drop night",source:"VITRINE P4: tuned by eye on NIWWTS No.06 renders of the element (sheets in docs/media/p4-tuning-*.png), niwwts-aesthetic as arbiter; unchanged from P1 after the review, frame 0 is the strongest",params:{fit:"contain",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:.6,frame:0,colors:["#151311","#3a4df0","#f2861e","#f1ece2"],distortion:.9,swirl:.25,grainMixer:0,grainOverlay:.08}},"acid-night":{name:"Acid night",source:"VITRINE P4: tuned by eye on NIWWTS No.06 renders of the element (sheets in docs/media/p4-tuning-*.png), niwwts-aesthetic as arbiter; the one place acid is allowed: ink, acid, blue-rice, paper",params:{fit:"contain",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:.4,frame:0,colors:["#151311","#d6f23c","#3a4df0","#f1ece2"],distortion:.8,swirl:.4,grainMixer:0,grainOverlay:.08}}}}});var Wt={};z(Wt,{default:()=>ur});var Nt,K,lr,ur,Yt=x(()=>{"use strict";Y();Qt();zt();P();Q();Nt=Gt,K=Nt.presets.default.params,lr={effect:"mesh",shader:"mesh-gradient",fragmentShader:Ot,image:"none",mipmaps:[],presets:Nt.presets,toUniforms(t){let e=Fe(t.colors,Fe(K.colors,[]));return{u_colors:e.map(r=>_(r)),u_colorsCount:e.length,u_distortion:f(t.distortion,f(K.distortion,.8)),u_swirl:f(t.swirl,f(K.swirl,.1)),u_grainMixer:f(t.grainMixer,f(K.grainMixer,0)),u_grainOverlay:f(t.grainOverlay,f(K.grainOverlay,0)),...R(t,K)}}},ur=lr});var Oe,Ht,Kt=x(()=>{"use strict";O();Oe={maxCrumpleCount:15},Ht=`#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform bool u_isImage;
uniform float u_imageAspectRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colorPaper;
uniform vec4 u_colorShadow;

uniform float u_blending;
uniform float u_distortion;
uniform bool u_clip;
uniform float u_angle;
uniform float u_seed;

uniform float u_roughness;
uniform float u_roughnessSize;
uniform float u_roughnessRows;
uniform float u_fiber;
uniform float u_fiberSize;
uniform float u_folds;
uniform float u_foldSizeX;
uniform float u_foldSizeY;
uniform float u_foldOffsetX;
uniform float u_foldOffsetY;
uniform float u_wrinkles;
uniform float u_wrinkleSize;
uniform float u_crumples;
uniform float u_crumpleCount;
uniform float u_drops;

uniform sampler2D u_noiseTexture;

in vec2 v_imageUV;
out vec4 fragColor;

float getUvFrame(vec2 uv) {
  vec2 invAA = .5 / clamp(fwidth(uv), 1e-5, .02);
  vec2 lo = clamp(uv * invAA + .5, 0., 1.);
  vec2 hi = clamp((1. - uv) * invAA + .5, 0., 1.);
  return lo.x * hi.x * lo.y * hi.y;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

${k}
${F}
${bt}

float getRoughness(vec2 p, vec2 lightDir, vec2 seedShift, float basePixel) {
  vec2 u = p / vec2(2, 4);
  float w = 100. * basePixel;
  float eps = 4. * w;

  float size = mix(3.2, .8, u_roughnessSize);
  float logLac = log2(2.1);
  float level = -log2(w + 1e-8) / logLac;
  float baseLevel = floor(level) - 2.;
  float fade = fract(level);

  vec2 px = (u.x + vec2(eps, -eps)) * .1;
  float py = u.y * .1;

  vec2 sum = vec2(0.);
  float norm = 0., amp = .5;
  float freq = exp2(baseLevel * logLac);
  for (int i = 0; i < 4; i++) {
    float absIdx = baseLevel + float(i);
    vec2 qx = size * px * freq;
    float qy = size * py * freq;

    float wi = 1.;
    if (i == 0) wi = 1. - fade;
    if (i == 3) wi = fade;

    vec2 fx = fract(qx);
    float fy = fract(qy);
    vec2 shift = .5 + absIdx * .3 + seedShift;
    float uvY = floor(qy) / 50. + shift.y;
    vec2 s0a = textureLod(u_noiseTexture, fract(vec2(floor(qx.x) / 50. + shift.x, uvY)), 0.).rg;
    vec2 s1a = textureLod(u_noiseTexture, fract(vec2( ceil(qx.x) / 50. + shift.x, uvY)), 0.).rg;
    vec2 s0b = textureLod(u_noiseTexture, fract(vec2(floor(qx.y) / 50. + shift.x, uvY)), 0.).rg;
    vec2 s1b = textureLod(u_noiseTexture, fract(vec2( ceil(qx.y) / 50. + shift.x, uvY)), 0.).rg;
    vec2 ny0 = mix(vec2(s0a.r, s0b.r), vec2(s0a.g, s0b.g), fy);
    vec2 ny1 = mix(vec2(s1a.r, s1b.r), vec2(s1a.g, s1b.g), fy);
    vec2 n = mix(ny0, ny1, fx);

    sum += amp * wi * n;
    norm += amp * wi;
    amp *= .8;
    freq *= 2.1;
  }

  vec2 r = sum / norm;
  float dx = .5 + r.x - r.y;
  float grain = 3. * dx * dx - .7;

  float rowBand = fract(dot(p, lightDir) * .05 * size);
  return grain + .6 * u_roughnessRows * (rowBand - .5);
}

float getFiber(vec2 p, vec2 seedShift, float basePixel) {
  float size = mix(4., 1., u_fiberSize);
  float w = 50. * basePixel;
  float level = -log2(w + 1e-8);
  float baseLevel = floor(level) - 3.;
  float fade = fract(level);

  vec2 grad = vec2(0.);
  float scale = 1.;
  float amp = 1.;
  float freq = pow(1.7, baseLevel);
  for (int i = 0; i < 5; i++) {
    float absIdx = baseLevel + float(i);
    vec2 q = size * p * freq;

    float an = absIdx * .8;
    float rc = cos(an), rs = sin(an);
    q = vec2(rc * q.x - rs * q.y, rs * q.x + rc * q.y);

    float wi = 1.;
    if (i == 0) wi = 1. - fade;
    if (i == 4) wi = fade;

    vec2 iq = floor(q);
    vec2 fq = fract(q);
    float shift = absIdx * .3;
    vec4 uv = fract(vec4(iq, iq + 1.) / 50. + .5 + shift + seedShift.xyxy);
    float aF = textureLod(u_noiseTexture, uv.xy, 0.).b;
    float bF = textureLod(u_noiseTexture, uv.zy, 0.).b;
    float cF = textureLod(u_noiseTexture, uv.xw, 0.).b;
    float dF = textureLod(u_noiseTexture, uv.zw, 0.).b;
    vec2 u = fq * fq * (3. - 2. * fq);
    vec2 du = 8. * fq * (1. - fq);
    float dx = du.x * mix(bF - aF, dF - cF, u.y);
    float dy = du.y * mix(cF - aF, dF - bF, u.x);
    grad += wi * amp * scale * vec2(rc * dx + rs * dy, -rs * dx + rc * dy);
    scale *= 1.7;
    amp *= .5;
    freq *= 1.7;
  }

  return clamp(.333 * length(grad), 0., 1.);
}

vec2 smoothNoise(vec2 p) {
  vec2 t = p * 50. - .5;
  vec2 i = floor(t);
  vec2 f = fract(t);
  f = f * f * (3. - 2. * f);
  return textureLod(u_noiseTexture, fract((i + f + .5) / vec2(50.)), 0.).rg;
}

float getDrops(vec2 uv, vec2 seedShift) {
  vec2 iDropsUV = floor(uv);
  vec2 fDropsUV = fract(uv);
  float dropsMinDist = 1.;
  for (int y = -1; y < 2; y += 1) {
    for (int x = -1; x < 2; x += 1) {
      vec2 neighbor = vec2(float(y), float(x));
      vec2 offset = hash22(iDropsUV + neighbor + 50. * seedShift);
      vec2 pos = neighbor + offset - fDropsUV;
      dropsMinDist *= min(1., dot(pos, pos));
    }
  }
  return .5 * lst(.09, .08, sqrt(sqrt(dropsMinDist)));
}

vec2 getCellTilt(float idx, float radius) {
  vec2 rand = hash22(vec2(idx + 31., idx * u_seed + 17.));
  float an = rand.x * TWO_PI;
  return vec2(cos(an), sin(an)) * mix(.3, 1.7, rand.y * rand.y) * mix(.7, 1., radius);
}

vec2 getCrumpleDetail(vec2 uv, float freq, float shift, float basePixel, out float depth) {
  depth = 0.;
  vec2 v = uv * freq;
  float pixel = .9 * freq * basePixel;
  vec2 base = floor(v);
  float n1 = 9., n2 = 9.;
  vec2 s1 = vec2(0.), s2 = vec2(0.), q1 = vec2(0.), q2 = vec2(0.);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cell = base + vec2(float(x), float(y));
      vec2 q = hash22(vec2(cell.y * 1.9 + 3.1 + shift, cell.x * 1.3 + .11 * u_seed));
      float keep = .8;
      if (q.y > keep) continue;

      vec2 r = hash22(vec2(cell.x + .37 * u_seed + shift + 11.1, cell.y - .21 * u_seed + 5.7));
      vec2 s = cell + .06 + .88 * r;

      vec2 d = v - s;
      float dsq = dot(d, d);
      if (dsq < n1) {
        n2 = n1;
        s2 = s1;
        q2 = q1;
        n1 = dsq;
        s1 = s;
        q1 = q;
      } else if (dsq < n2) {
        n2 = dsq;
        s2 = s;
        q2 = q;
      }
    }
  }

  if (n1 > 8.) return vec2(0.);

  float an1 = q1.x * TWO_PI, mag1 = q1.y / .8;
  vec2 t1 = vec2(cos(an1), sin(an1)) * mix(.3, 1.7, mag1 * mag1);
  float an2 = q2.x * TWO_PI, mag2 = q2.y / .8;
  vec2 t2 = vec2(cos(an2), sin(an2)) * mix(.3, 1.7, mag2 * mag2);

  vec2 span = s1 - s2;
  float spanLen = max(length(span), 1e-4);
  float toEdge = (n2 - n1) / (2. * spanLen);

  float pair = hash21(s1 + s2 + 1.7 * abs(s1 - s2));
  float pairSoft = .05 + .1 * step(pair, .4);
  float b = clamp(toEdge / max(1.5 * pixel, .5 * pairSoft), 0., 1.);
  b = b * b * (3. - 2. * b);
  float d1 = max(sqrt(n1), 1e-4);
  depth = .2 * d1;
  float shoulderAmt = max(0., 1. - toEdge / .42) * b;
  vec2 shoulder = vec2(0.);
  if (shoulderAmt > 0.) {
    float d2 = max(sqrt(n2), 1e-4);
    shoulder = shoulderAmt * ((v - s2) / d2 - (v - s1) / d1);
  }

  vec2 mid = .5 * (t1 + t2);
  return mid + (t1 - mid) * b + .9 * shoulder;
}

vec4 getCrumples(vec2 uv) {
  float crumpleN = max(2., floor(u_crumpleCount + .5));
  float near = 60000., nearB = 60000.;
  float idx = 0., rad = 0.;
  vec2 nearP = vec2(0.), nearPb = vec2(0.);
  vec4 seeds[${Oe.maxCrumpleCount}];
  for (int i = 0; i < ${Oe.maxCrumpleCount}; i++) {
    if (float(i) >= crumpleN) break;
    vec2 rand = hash22(vec2(float(i), float(i) * u_seed));
    float an = rand.x * TWO_PI;
    vec2 p = vec2(cos(an), sin(an)) * rand.y;
    seeds[i] = vec4(p, rand);

    vec2 d = uv - p;
    float dsq = dot(d, d);
    if (dsq < near) {
      nearB = near;
      nearPb = nearP;
      near = dsq;
      idx = float(i);
      rad = rand.y;
      nearP = p;
    } else if (dsq < nearB) {
      nearB = dsq;
      nearPb = p;
    }
  }
  float l = sqrt(near), lb = sqrt(nearB);
  vec2 dir = (uv - nearP) / max(l, 1e-4);
  float edge = lst(0., .5, lb - l);

  float shoulderLimit = l + .5;

  vec2 tilt = getCellTilt(idx, rad);
  float tiltSum = 1.;
  vec2 wide = vec2(0.);
  float wideSum = 0.;
  float toEdge = 9., edgeSoft = 0.;

  for (int i = 0; i < ${Oe.maxCrumpleCount}; i++) {
    if (float(i) >= crumpleN) break;
    if (float(i) == idx) continue;
    vec4 seed = seeds[i];
    vec2 p = seed.xy;
    vec2 rand = seed.zw;

    vec2 d = uv - p;
    float dsq = dot(d, d);

    if (dsq < shoulderLimit * shoulderLimit) {
      float di = sqrt(dsq);
      float shoulder = lst(.5, 0., di - l);
      wide += shoulder * (d / max(di, 1e-4) - dir);
      wideSum += shoulder;
    }

    float pairSoft = .01 + .05 * step(.2, rand.x) + .3 * rand.y;
    float toBisector = (dsq - near) / (.2 * max(length(p - nearP), 1e-4));
    if (toBisector < toEdge) {
      toEdge = toBisector;
      edgeSoft = pairSoft;
    }

    float w = 1. - toBisector / pairSoft;
    if (w > 0.) {
      w *= w;
      tilt += w * getCellTilt(float(i), rand.y);
      tiltSum += w;
    }
  }

  float blend = clamp(toEdge / edgeSoft, 0., 1.);
  vec2 sharp = (1. - edge) * ((uv - nearPb) / max(lb, 1e-4) - dir);
  vec2 rounding = mix(sharp, wide / max(wideSum, 1.), min(2. * edgeSoft, 1.));
  float radial = l / max(l + toEdge, 1e-4);

  return vec4(tilt / tiltSum + rounding * blend * radial, .2 * l, edge);
}

void getFolds(vec2 coord, vec2 offset, vec2 count, vec2 noise, vec2 baseFwidth, out vec2 slope, out vec2 dark, out vec2 lift) {
  vec2 g = coord * count + .5 * offset + noise;
  vec2 dx = fract(g) - .5;
  vec2 adx = abs(dx);
  float foldRadius = .3;
  vec2 t = clamp(adx / foldRadius, 0., 1.);
  dark = t * t * (3. - 2. * t);
  lift = 1. - t;
  lift *= lift;

  vec2 crease = clamp(dx / max(count * baseFwidth, 1e-5), -1., 1.);
  slope = crease * (1. - dark);

  vec2 lineWidth = .02 * count * mix(vec2(2.5), vec2(.8), dark.yx) + .1 * noise;
  slope -= 1. - smoothstep(vec2(0.), lineWidth, adx);
}

void main() {

  vec2 patternUV = (v_imageUV - .5) * vec2(u_imageAspectRatio, 1.);
  float basePixel = max(length(dFdx(patternUV)), length(dFdy(patternUV)));
  vec2 baseFwidth = fwidth(patternUV);

  float pattern = 0.;

  float crumpleDepth = 0.;
  float wrinkleDepth = 0.;
  float foldDepth = 0.;
  float roughness = 0.;
  float fiber = 0.;
  float drops = 0.;

  float grazing = 0.7;
  float lightRad = radians(u_angle);
  vec2 lightDir = vec2(sin(lightRad), -cos(lightRad));
  float foldAngleInSector = mod(u_angle, 90.);
  float foldLightRad = radians(u_angle - foldAngleInSector + mix(12., 78., foldAngleInSector / 90.));
  vec2 foldLightDir = vec2(sin(foldLightRad), -cos(foldLightRad));
  vec2 relief = vec2(0.);
  vec2 foldSlope = vec2(0.);
  float reliefAmount = 0.;
  float foldInk = 1.;
  vec2 crumpleFlow = vec2(0.);

  vec2 warpNoise = vec2(0.);
  if (u_crumples > 0. || u_folds > 0. || u_wrinkles > 0.) {
    warpNoise = smoothNoise(patternUV * .1 + .2 + .6 * fract(.017 * u_seed)) - .5;
  }
  vec2 crumplesUV = (patternUV * .9) + .012 * warpNoise;

  if (u_crumples > 0.) {
    vec4 crumples = getCrumples(crumplesUV);

    vec2 crumpleTilt = .5 * u_crumples * crumples.xy;
    crumpleTilt -= .1 * max(dot(crumpleTilt, lightDir), 0.) * lightDir;
    relief += crumpleTilt;
    reliefAmount += .6 * u_crumples;
    crumpleFlow = crumples.w * crumpleTilt;

    crumpleDepth = clamp(5. * crumples.z, 0., 1.);
  }

  if (u_wrinkles > 0.) {
    float detailFreq = mix(10., 1., u_wrinkleSize);
    float detailAmp = .2;
    vec2 detailGrad = vec2(0.);
    float detailDepth = 0., depthSum = 0.;
    for (int i = 0; i < 3; i++) {
      float layerDepth;
      detailGrad += detailAmp * getCrumpleDetail(crumplesUV, detailFreq, 31. * float(i), basePixel, layerDepth);
      detailDepth += detailAmp * layerDepth;
      depthSum += detailAmp;
      detailAmp *= (.5 + .2 * detailGrad.x);
      detailFreq *= 2.1;
    }

    vec2 detailTilt = 1.5 * u_wrinkles * detailGrad;
    detailTilt -= .65 * max(dot(detailTilt, lightDir), 0.) * lightDir;
    relief += detailTilt;
    reliefAmount += .6 * u_wrinkles;

    wrinkleDepth = clamp(5. * detailDepth / max(depthSum, 1e-4), 0., 1.);
  }

  if (u_folds > 0.) {
    vec2 foldOffset = vec2(1. - 2. * u_foldOffsetX, 1. - 2. * u_foldOffsetY);
    vec2 foldCount = vec2(mix(3., .5, u_foldSizeX), mix(3., .5, u_foldSizeY));
    vec2 foldNoise = .005 * warpNoise * foldCount;
    vec2 uv = patternUV + .03 * crumpleFlow;

    vec2 slope, dark, lift;
    getFolds(uv, foldOffset, foldCount, foldNoise, baseFwidth, slope, dark, lift);

    foldSlope = u_folds * slope;
    reliefAmount += 1. * u_folds;
    vec2 ink = mix(vec2(.96), vec2(1.), dark);
    float flatness = dark.x * dark.y;
    foldInk *= mix(1., ink.x * ink.y * mix(.5, .3, flatness), u_folds);

    foldDepth = u_folds * (lift.y * foldLightDir.y - lift.x * foldLightDir.x);
  }

  float unlit = cos(grazing);
  float lit = unlit;

  if (reliefAmount > 0.) {
    float lightFalloff = clamp(.5 + dot(v_imageUV - .5, lightDir), 0., 1.);
    float lightPower = mix(.5, 1., lightFalloff);
    float slope = clamp(dot(relief, lightDir) + dot(foldSlope, foldLightDir), -1.2, 1.2);
    lit = max(cos(slope + grazing), 0.);

    pattern += (clamp(reliefAmount, 0., 1.) * unlit + (lit - unlit)) * foldInk * lightPower;
  }

  patternUV += .04 * crumpleFlow;

  vec2 seedShift = floor(fract(u_seed * vec2(.7548776662, .5698402909)) * 50.) / 50.;

  if (u_roughness > 0.) {
    roughness = u_roughness * getRoughness(1000. * patternUV, lightDir, seedShift, basePixel);
    pattern += roughness;
  }

  if (u_fiber > 0.) {
    fiber = u_fiber * getFiber(50. * patternUV, seedShift, basePixel);
    pattern += fiber;
  }

  if (u_drops > 0.) {
    drops = u_drops * getDrops(patternUV * 10., seedShift);
  }

  pattern = clamp(pattern, 0., 1.);

  vec3 backColor = u_colorBack.rgb * u_colorBack.a;
  float backOpacity = u_colorBack.a;
  vec3 baseColor = u_colorPaper.rgb * u_colorPaper.a;
  float baseOpacity = u_colorPaper.a;
  vec3 shadowColor = u_colorShadow.rgb * u_colorShadow.a;
  float shadowOpacity = u_colorShadow.a;

  float notClipped = u_clip ? .1 : 1.;
  vec2 imageCenteredUV = v_imageUV - .5;
  float edgeDist = 2. * max(abs(imageCenteredUV.x), abs(imageCenteredUV.y));
  float wrinkleDistortion = mix(.38, .0175, smoothstep(0., 1., edgeDist));
  float scaleDistortion = .15 * u_crumples * (crumpleDepth - .5) + wrinkleDistortion * u_wrinkles * (wrinkleDepth - .5) + .05 * foldDepth;
  vec2 linearDistortion = notClipped * .002 * lightDir * drops;
  float radialDistortion = notClipped * .02 * (roughness + fiber);
  vec2 centeredUV = imageCenteredUV * (1. - u_distortion * scaleDistortion);
  centeredUV -= u_distortion * linearDistortion;
  vec2 imageUV = .5 + centeredUV * (1. - abs(u_distortion) * radialDistortion * dot(centeredUV, centeredUV));

  vec3 color = shadowColor * pattern;
  float opacity = shadowOpacity * pattern;
  color += baseColor * (1. - opacity);
  opacity += baseOpacity * (1. - opacity);

  if (u_isImage) {
    float frame = getUvFrame(imageUV);
    vec4 image = texture(u_image, imageUV);
    frame *= image.a;

    float maxC = max(max(image.r, image.g), image.b);
    float minC = min(min(image.r, image.g), image.b);
    float sat = maxC > 0. ? (maxC - minC) / maxC : 0.;
    float midC = image.r + image.g + image.b - maxC - minC;
    float secondaryness = maxC > minC ? (midC - minC) / (maxC - minC) : 0.;
    float satDampen = sat * (1. - .5 * secondaryness);
    float darkDampen = 1. - dot(vec3(.2126, .7152, .0722), image.rgb);
    float dampen = mix(0., .7, u_blending) * max(satDampen, darkDampen);

    vec3 paper = vec3(1.) - opacity + color;
    vec3 pic = image.rgb * paper * u_blending + image.rgb * (1. - u_blending);
    pic = mix(pic, vec3(1.), .6 * pow(dampen, 2. + 3. * pattern));

    color = mix(color, pic, frame);
    opacity = frame + opacity * (1. - frame);

    if (u_clip) {
      color *= frame;
      opacity *= frame;
    }
  }

  color *= mix(vec3(1.), .5 * u_colorShadow.rgb, drops * shadowOpacity);

  color += backColor * (1. - opacity);
  opacity += backOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`});var Xt,qt=x(()=>{Xt={effect:"paper",shader:"paper-texture",paperShaders:"0.0.82",presets:{default:{name:"Default",source:"@paper-design/shaders-react 0.0.82, paper-texture.tsx defaultPreset (1:1)",params:{fit:"contain",scale:.9,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:0,frame:0,colorBack:"#d3d2ab",colorPaper:"#ffffff",colorShadow:"#cccccc",blending:1,distortion:.75,clip:!1,angle:300,seed:4,roughness:.4,roughnessSize:.5,roughnessRows:0,fiber:.4,fiberSize:.5,folds:.5,foldSizeX:1,foldSizeY:1,foldOffsetX:0,foldOffsetY:0,wrinkles:1,wrinkleSize:.65,crumples:0,crumpleCount:6,drops:.4}},"folded-lookbook":{name:"Folded lookbook",source:"VITRINE P4: tuned by eye on NIWWTS No.06 renders of the element (sheets in docs/media/p4-tuning-*.png), niwwts-aesthetic as arbiter; one full fold instead of a half one, fewer crumples, light from 300 deg so the crease reads",params:{fit:"cover",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:0,frame:0,colorBack:"#f1ece2",colorPaper:"#ffffff",colorShadow:"#b3b3b3",blending:.9,distortion:-.4,clip:!1,angle:300,seed:49,roughness:.35,roughnessSize:.3,roughnessRows:0,fiber:.3,fiberSize:.5,folds:1,foldSizeX:.6,foldSizeY:.89,foldOffsetX:.59,foldOffsetY:1,wrinkles:0,wrinkleSize:.65,crumples:.3,crumpleCount:4,drops:.1}}}}});var jt={};z(jt,{default:()=>dr});var Jt,he,E,Qe,fr,dr,Zt=x(()=>{"use strict";Y();Kt();qt();P();Le();Q();Jt=Xt,he=Jt.presets.default.params,E=(t,e)=>f(t[e],f(he[e],0)),Qe=(t,e)=>_(p(t[e],p(he[e],""))),fr={effect:"paper",shader:"paper-texture",fragmentShader:Ht,image:"optional",loadNoise:me,mipmaps:["u_image"],presets:Jt.presets,toUniforms(t,{image:e,noise:i}){return{u_image:e,u_isImage:!!e,u_colorBack:Qe(t,"colorBack"),u_colorPaper:Qe(t,"colorPaper"),u_colorShadow:Qe(t,"colorShadow"),u_blending:E(t,"blending"),u_distortion:E(t,"distortion"),u_clip:L(t.clip,L(he.clip,!1)),u_angle:E(t,"angle"),u_seed:E(t,"seed"),u_roughness:E(t,"roughness"),u_roughnessSize:E(t,"roughnessSize"),u_roughnessRows:E(t,"roughnessRows"),u_fiber:E(t,"fiber"),u_fiberSize:E(t,"fiberSize"),u_folds:E(t,"folds"),u_foldSizeX:E(t,"foldSizeX"),u_foldSizeY:E(t,"foldSizeY"),u_foldOffsetX:E(t,"foldOffsetX"),u_foldOffsetY:E(t,"foldOffsetY"),u_wrinkles:E(t,"wrinkles"),u_wrinkleSize:E(t,"wrinkleSize"),u_crumples:E(t,"crumples"),u_crumpleCount:E(t,"crumpleCount"),u_drops:E(t,"drops"),u_noiseTexture:i,...R(t,he)}}},dr=fr});var $t,ei,ti,ii=x(()=>{"use strict";O();$t=`#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colorShadow;
uniform vec4 u_colorHighlight;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_size;
uniform float u_shadows;
uniform float u_angle;
uniform float u_stretch;
uniform float u_shape;
uniform float u_distortion;
uniform float u_highlights;
uniform float u_distortionShape;
uniform float u_shift;
uniform float u_blur;
uniform float u_edges;
uniform float u_marginLeft;
uniform float u_marginRight;
uniform float u_marginTop;
uniform float u_marginBottom;
uniform float u_grainMixer;
uniform float u_grainOverlay;

in vec2 v_imageUV;

out vec4 fragColor;

${k}
${H}
${F}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float getUvFrame(vec2 uv, float softness) {
  float aax = 2. * fwidth(uv.x);
  float aay = 2. * fwidth(uv.y);
  float left   = smoothstep(0., aax + softness, uv.x);
  float right  = 1. - smoothstep(1. - softness - aax, 1., uv.x);
  float bottom = smoothstep(0., aay + softness, uv.y);
  float top    = 1. - smoothstep(1. - softness - aay, 1., uv.y);
  return left * right * bottom * top;
}

const int MAX_RADIUS = 50;
vec4 samplePremultiplied(sampler2D tex, vec2 uv) {
  vec4 c = texture(tex, uv);
  c.rgb *= c.a;
  return c;
}
vec4 getBlur(sampler2D tex, vec2 uv, vec2 texelSize, vec2 dir, float sigma) {
  if (sigma <= .5) return texture(tex, uv);
  int radius = int(min(float(MAX_RADIUS), ceil(3.0 * sigma)));

  float twoSigma2 = 2.0 * sigma * sigma;
  float gaussianNorm = 1.0 / sqrt(TWO_PI * sigma * sigma);

  vec4 sum = samplePremultiplied(tex, uv) * gaussianNorm;
  float weightSum = gaussianNorm;

  for (int i = 1; i <= MAX_RADIUS; i++) {
    if (i > radius) break;

    float x = float(i);
    float w = exp(-(x * x) / twoSigma2) * gaussianNorm;

    vec2 offset = dir * texelSize * x;
    vec4 s1 = samplePremultiplied(tex, uv + offset);
    vec4 s2 = samplePremultiplied(tex, uv - offset);

    sum += (s1 + s2) * w;
    weightSum += 2.0 * w;
  }

  vec4 result = sum / weightSum;
  if (result.a > 0.) {
    result.rgb /= result.a;
  }

  return result;
}

vec2 rotateAspect(vec2 p, float a, float aspect) {
  p.x *= aspect;
  p = rotate(p, a);
  p.x /= aspect;
  return p;
}

float smoothFract(float x) {
  float f = fract(x);
  float w = fwidth(x);

  float edge = abs(f - 0.5) - 0.5;
  float band = smoothstep(-w, w, edge);

  return mix(f, 1.0 - f, band);
}

void main() {

  float patternRotation = -u_angle * PI / 180.;
  float patternSize = mix(200., 5., u_size);

  vec2 uv = v_imageUV;

  vec2 uvMask = gl_FragCoord.xy / u_resolution.xy;
  vec2 sw = vec2(.005);
  vec4 margins = vec4(u_marginLeft, u_marginTop, u_marginRight, u_marginBottom);
  float mask =
  smoothstep(margins[0], margins[0] + sw.x, uvMask.x + sw.x) *
  smoothstep(margins[2], margins[2] + sw.x, 1.0 - uvMask.x + sw.x) *
  smoothstep(margins[1], margins[1] + sw.y, uvMask.y + sw.y) *
  smoothstep(margins[3], margins[3] + sw.y, 1.0 - uvMask.y + sw.y);
  float maskOuter =
  smoothstep(margins[0] - sw.x, margins[0], uvMask.x + sw.x) *
  smoothstep(margins[2] - sw.x, margins[2], 1.0 - uvMask.x + sw.x) *
  smoothstep(margins[1] - sw.y, margins[1], uvMask.y + sw.y) *
  smoothstep(margins[3] - sw.y, margins[3], 1.0 - uvMask.y + sw.y);
  float maskStroke = maskOuter - mask;
  float maskInner =
  smoothstep(margins[0] - 2. * sw.x, margins[0], uvMask.x) *
  smoothstep(margins[2] - 2. * sw.x, margins[2], 1.0 - uvMask.x) *
  smoothstep(margins[1] - 2. * sw.y, margins[1], uvMask.y) *
  smoothstep(margins[3] - 2. * sw.y, margins[3], 1.0 - uvMask.y);
  float maskStrokeInner = maskInner - mask;

  uv -= .5;
  uv *= patternSize;
  uv = rotateAspect(uv, patternRotation, u_imageAspectRatio);

  float curve = 0.;
  float patternY = uv.y / u_imageAspectRatio;
  if (u_shape > 4.5) {
    // pattern
    curve = .5 + .5 * sin(.5 * PI * uv.x) * cos(.5 * PI * patternY);
  } else if (u_shape > 3.5) {
    // zigzag
    curve = 10. * abs(fract(.1 * patternY) - .5);
  } else if (u_shape > 2.5) {
    // wave
    curve = 4. * sin(.23 * patternY);
  } else if (u_shape > 1.5) {
    // lines irregular
    curve = .5 + .5 * sin(.5 * uv.x) * sin(1.7 * uv.x);
  } else {
    // lines
  }

  vec2 UvToFract = uv + curve;
  vec2 fractOrigUV = fract(uv);
  vec2 floorOrigUV = floor(uv);

  float x = smoothFract(UvToFract.x);
  float xNonSmooth = fract(UvToFract.x) + .0001;

  float highlightsWidth = 2. * max(.001, fwidth(UvToFract.x));
  highlightsWidth += 2. * maskStrokeInner;
  float highlights = smoothstep(0., highlightsWidth, xNonSmooth);
  highlights *= smoothstep(1., 1. - highlightsWidth, xNonSmooth);
  highlights = 1. - highlights;
  highlights *= u_highlights;
  highlights = clamp(highlights, 0., 1.);
  highlights *= mask;

  float shadows = pow(x, 1.3);
  float distortion = 0.;
  float fadeX = 1.;
  float frameFade = 0.;

  float aa = fwidth(xNonSmooth);
  aa = max(aa, fwidth(uv.x));
  aa = max(aa, fwidth(UvToFract.x));
  aa = max(aa, .0001);

  if (u_distortionShape == 1.) {
    distortion = -pow(1.5 * x, 3.);
    distortion += (.5 - u_shift);

    frameFade = pow(1.5 * x, 3.);
    aa = max(.2, aa);
    aa += mix(.2, 0., u_size);
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    distortion = mix(.5, distortion, fadeX);
  } else if (u_distortionShape == 2.) {
    distortion = 2. * pow(x, 2.);
    distortion -= (.5 + u_shift);

    frameFade = pow(abs(x - .5), 4.);
    aa = max(.2, aa);
    aa += mix(.2, 0., u_size);
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    distortion = mix(.5, distortion, fadeX);
    frameFade = mix(1., frameFade, .5 * fadeX);
  } else if (u_distortionShape == 3.) {
    distortion = pow(2. * (xNonSmooth - .5), 6.);
    distortion -= .25;
    distortion -= u_shift;

    frameFade = 1. - 2. * pow(abs(x - .4), 2.);
    aa = .15;
    aa += mix(.1, 0., u_size);
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    frameFade = mix(1., frameFade, fadeX);

  } else if (u_distortionShape == 4.) {
    x = xNonSmooth;
    distortion = sin((x + .25) * TWO_PI);
    shadows = .5 + .5 * asin(distortion) / (.5 * PI);
    distortion *= .5;
    distortion -= u_shift;
    frameFade = .5 + .5 * sin(x * TWO_PI);
  } else if (u_distortionShape == 5.) {
    distortion -= pow(abs(x), .2) * x;
    distortion += .33;
    distortion -= 3. * u_shift;
    distortion *= .33;

    frameFade = .3 * (smoothstep(.0, 1., x));
    shadows = pow(x, 2.5);

    aa = max(.1, aa);
    aa += mix(.1, 0., u_size);
    fadeX = smoothstep(0., aa, xNonSmooth) * smoothstep(1., 1. - aa, xNonSmooth);
    distortion *= fadeX;
  }

  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec2 grainUV = v_imageUV - .5;
  grainUV *= (.8 / vec2(length(dudx), length(dudy)));
  grainUV += .5;
  if (u_grainMixer > 0.) {
    float grain = valueNoise(grainUV);
    grain = smoothstep(.4, .7, grain);
    grain *= u_grainMixer;
    distortion = mix(distortion, 0., grain);
  }

  shadows = min(shadows, 1.);
  shadows += maskStrokeInner;
  shadows *= mask;
  shadows = min(shadows, 1.);
  shadows *= pow(u_shadows, 2.);
  shadows = clamp(shadows, 0., 1.);

  distortion *= 3. * u_distortion;
  frameFade *= u_distortion;

  fractOrigUV.x += distortion;
  floorOrigUV = rotateAspect(floorOrigUV, -patternRotation, u_imageAspectRatio);
  fractOrigUV = rotateAspect(fractOrigUV, -patternRotation, u_imageAspectRatio);

  uv = (floorOrigUV + fractOrigUV) / patternSize;
  uv += pow(maskStroke, 4.);

  uv += vec2(.5);

  uv = mix(v_imageUV, uv, smoothstep(0., .7, mask));
  float blur = mix(0., 50., u_blur);
  blur = mix(0., blur, smoothstep(.5, 1., mask));

  float edgeDistortion = mix(.0, .04, u_edges);
  edgeDistortion += .06 * frameFade * u_edges;
  edgeDistortion *= mask;
  float frame = getUvFrame(uv, edgeDistortion);

  float stretch = 1. - smoothstep(0., .5, xNonSmooth) * smoothstep(1., 1. - .5, xNonSmooth);
  stretch = pow(stretch, 2.);
  stretch *= mask;
  stretch *= getUvFrame(uv, .1 + .05 * mask * frameFade);
  uv.y = mix(uv.y, .5, u_stretch * stretch);

  vec4 image = getBlur(u_image, uv, 1. / u_resolution / u_pixelRatio, vec2(0., 1.), blur);
  image.rgb *= image.a;
  vec4 backColor = u_colorBack;
  backColor.rgb *= backColor.a;
  vec4 highlightColor = u_colorHighlight;
  highlightColor.rgb *= highlightColor.a;
  vec4 shadowColor = u_colorShadow;

  vec3 color = highlightColor.rgb * highlights;
  float opacity = highlightColor.a * highlights;

  shadows = mix(shadows * shadowColor.a, 0., highlights);
  color = mix(color, shadowColor.rgb * shadowColor.a, .5 * shadows);
  color += .5 * pow(shadows, .5) * shadowColor.rgb;
  opacity += shadows;
  color = clamp(color, vec3(0.), vec3(1.));
  opacity = clamp(opacity, 0., 1.);

  color += image.rgb * (1. - opacity) * frame;
  opacity += image.a * (1. - opacity) * frame;

  color += backColor.rgb * (1. - opacity);
  opacity += backColor.a * (1. - opacity);

  if (u_grainOverlay > 0.) {
    float grainOverlay = valueNoise(rotate(grainUV, 1.) + vec2(3.));
    grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
    grainOverlay = pow(grainOverlay, 1.3);

    float grainOverlayV = grainOverlay * 2. - 1.;
    vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
    float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
    grainOverlayStrength = pow(grainOverlayStrength, .8);
    grainOverlayStrength *= mask;
    color = mix(color, grainOverlayColor, .35 * grainOverlayStrength);

    opacity += .5 * grainOverlayStrength;
  }
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`,ei={lines:1,linesIrregular:2,wave:3,zigzag:4,pattern:5},ti={prism:1,lens:2,contour:3,cascade:4,flat:5}});var oi,ri=x(()=>{oi={effect:"glass",shader:"fluted-glass",paperShaders:"0.0.82",presets:{default:{name:"Default",source:"@paper-design/shaders-react 0.0.82, fluted-glass.tsx defaultPreset (1:1)",params:{fit:"cover",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:0,frame:0,colorBack:"#00000000",colorShadow:"#000000",colorHighlight:"#ffffff",shadows:.25,size:.5,angle:0,distortionShape:"prism",highlights:.1,shape:"lines",distortion:.5,shift:0,blur:0,edges:.25,stretch:0,margin:0,marginLeft:0,marginRight:0,marginTop:0,marginBottom:0,grainMixer:0,grainOverlay:0}},window:{name:"Window",source:"examples/r0/effects.js (R0, approved at the R0 gate 30.10.2026), copied 1:1: fluted-glass base + preset A 'Window'. size 0.95 = about 15 reeds across the image (mix(200, 5, size)); scale 1.06 overfills so the reeds never sample past the photo edge",params:{speed:0,frame:0,fit:"cover",scale:1.06,colorBack:"#00000000",colorShadow:"#141312",colorHighlight:"#ffffff",shape:"lines",angle:0,edges:0,size:.95,distortionShape:"contour",distortion:.3,highlights:.18,shadows:.2}},"preorder-30":{name:"Pre-order, 30 days out",source:"examples/r0/effects.js (R0, approved at the R0 gate 30.10.2026), copied 1:1: fluted-glass-preorder base + '30 days out'. Anchor of the date curve (bind date)",params:{speed:0,frame:0,fit:"cover",scale:1.06,colorBack:"#00000000",colorShadow:"#141312",colorHighlight:"#ffffff",shape:"lines",angle:0,edges:0,size:.95,distortionShape:"contour",distortion:.5,blur:.6,stretch:.1,highlights:.12,shadows:.2,grainOverlay:.05}},"preorder-7":{name:"Pre-order, 7 days out",source:"examples/r0/effects.js (R0, approved at the R0 gate 30.10.2026), copied 1:1: fluted-glass-preorder base + '7 days out'. Anchor of the date curve",params:{speed:0,frame:0,fit:"cover",scale:1.06,colorBack:"#00000000",colorShadow:"#141312",colorHighlight:"#ffffff",shape:"lines",angle:0,edges:0,size:.95,distortionShape:"contour",distortion:.4,blur:.3,highlights:.15,shadows:.2,grainOverlay:.04}},"preorder-1":{name:"Pre-order, 1 day out",source:"examples/r0/effects.js (R0, approved at the R0 gate 30.10.2026), copied 1:1: fluted-glass-preorder base + '1 day out'. Anchor of the date curve",params:{speed:0,frame:0,fit:"cover",scale:1.06,colorBack:"#00000000",colorShadow:"#141312",colorHighlight:"#ffffff",shape:"lines",angle:0,edges:0,size:.95,distortionShape:"contour",distortion:.3,blur:.1,highlights:.18,shadows:.2,grainOverlay:.02}}}}});var si={};z(si,{default:()=>gr});function ni(t,e,i){return e in t?t[e]:t[i]}function ge(t,e){return typeof t[e]=="number"||typeof t[e]=="string"?B(t,e):f(t.margin,B(q,e))}var ai,q,B,ze,hr,gr,li=x(()=>{"use strict";Y();ii();ri();P();Q();ai=oi,q=ai.presets.default.params,B=(t,e)=>f(t[e],f(q[e],0)),ze=(t,e)=>_(p(t[e],p(q[e],"")));hr={effect:"glass",shader:"fluted-glass",fragmentShader:$t,image:"required",mipmaps:["u_image"],presets:ai.presets,toUniforms(t,{image:e}){return{u_image:e,u_colorBack:ze(t,"colorBack"),u_colorShadow:ze(t,"colorShadow"),u_colorHighlight:ze(t,"colorHighlight"),u_shadows:B(t,"shadows"),u_size:B(t,"size"),u_angle:B(t,"angle"),u_distortion:B(t,"distortion"),u_shift:B(t,"shift"),u_blur:B(t,"blur"),u_edges:B(t,"edges"),u_stretch:B(t,"stretch"),u_distortionShape:ni(ti,p(t.distortionShape,p(q.distortionShape,"prism")),"prism"),u_highlights:B(t,"highlights"),u_shape:ni(ei,p(t.shape,p(q.shape,"lines")),"lines"),u_marginLeft:ge(t,"marginLeft"),u_marginRight:ge(t,"marginRight"),u_marginTop:ge(t,"marginTop"),u_marginBottom:ge(t,"marginBottom"),u_grainMixer:B(t,"grainMixer"),u_grainOverlay:B(t,"grainOverlay"),...R(t,q)}}},gr=hr});var pr,ui,ci=x(()=>{"use strict";O();pr={maxSamples:50},ui=`#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform float u_spread;
uniform float u_bias;
uniform float u_angle;
uniform float u_perspective;
uniform float u_count;
uniform float u_dispersion;
uniform float u_dispersionShift;
uniform float u_dispersionColor;
uniform float u_focusCenter;
uniform float u_focusEdges;
uniform float u_swirl;
uniform float u_noise;
uniform float u_noiseFrequency;
uniform float u_noiseOffset;
uniform float u_lensBulge;
uniform float u_lensCircle;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_imageX;
uniform float u_imageY;

in vec2 v_imageUV;

out vec4 fragColor;

${k}
${F}
${H}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1., 0.));
  float c = hash21(i + vec2(0., 1.));
  float d = hash21(i + vec2(1., 1.));
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float getUvFrame(vec2 uv) {
  vec2 invAA = 1. / clamp(fwidth(uv), 1e-5, .02);
  vec2 lo = clamp(uv * invAA + .5, 0., 1.);
  vec2 hi = clamp((1. - uv) * invAA + .5, 0., 1.);
  return lo.x * hi.x * lo.y * hi.y;
}

vec4 sampleOverWhite(vec2 uv) {
  vec4 img = texture(u_image, uv);
  float cover = img.a * getUvFrame(uv);
  vec3 colorOverWhite = mix(vec3(1.), img.rgb, cover);
  return vec4(colorOverWhite, cover);
}

vec3 hueColor(float hue) {
  vec3 rgb = clamp(abs(mod(hue * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
  rgb = rgb * rgb * (3. - 2. * rgb);
  return rgb;
}
                                            
float boxInradius() {
  return .5 * min(u_imageAspectRatio, 1.);
}

float boxOutradius() {
  return .5 * length(vec2(u_imageAspectRatio, 1.));
}

float spreadReach() {
  return .7 * pow(u_spread, 1.3 + 2.7 * u_spread);
}

float innerCircleMask(float radius, float inradius) {
  return 1. - smoothstep(.5 * inradius, 1.1 * inradius, radius);
}

float dispersionCurve(float t, float biasPow) {
  float mirroredT = u_bias < 0. ? 1. - t : t;
  float curved = pow(mirroredT, biasPow);
  return u_bias < 0. ? 1. - curved : curved;
}

vec2 getSpread(vec2 fromCenter, float radius, vec2 warpedUV, float edgeAA, float inradius, float outradius, float reach, out float outStrength) {
  float angleRad = radians(u_angle);
  vec2 uniformDir = vec2(cos(angleRad), sin(angleRad));

  float invInradius = 1. / inradius;
  vec2 radialDir = fromCenter * invInradius;
  float maxLen = (outradius + reach) * invInradius;
  float radialLen = radius * invInradius;
  if (radialLen > maxLen) radialDir *= maxLen / radialLen;
  vec2 spreadDir = mix(uniformDir, radialDir, u_perspective);

  float bandProximity = smoothstep(inradius * .8, inradius, radius);
  float lensCircleMaxing = bandProximity * u_lensCircle * u_lensCircle * u_lensCircle;
  spreadDir = mix(spreadDir, radialDir, lensCircleMaxing);

  vec2 warpedAbs = abs(warpedUV - .5);
  float inner = mix(1., smoothstep(0., mix(inradius, outradius, u_focusCenter), radius), u_focusCenter);
  float boxDist = max(warpedAbs.x, warpedAbs.y) * 2.;
  float outer = mix(1., 1. - min(boxDist, 1.), u_focusEdges);
  float strength = inner * outer;

  strength *= mix(1., mix(.15, .03, max(-u_lensBulge, 0.)), lensCircleMaxing);

  vec2 outside = max(warpedAbs - .5, 0.);
  float margin = max(reach * length(spreadDir) * (1. - u_lensCircle), edgeAA);
  strength *= 1. - smoothstep(0., margin, length(outside));

  outStrength = strength;
  vec2 axis = spreadDir * (reach * strength);

  if (u_noise > 0.) {
    float turn = (valueNoise(fromCenter * u_noiseFrequency * 18. + u_noiseOffset * 30.) - .5) * 2. * u_noise;
    float cs = cos(turn), sn = sin(turn);
    axis = mat2(cs, -sn, sn, cs) * axis;
  }

  axis.x /= u_imageAspectRatio;
  return axis;
}

vec2 lensWarp(vec2 fromCenter, float radius, float inradius, out float bulgeFade) {
  bulgeFade = 1.;
  if (u_lensBulge == 0. && u_lensCircle <= 0.) return fromCenter;
  if (radius < 1e-5) return fromCenter;
  
  float r = radius;

  if (u_lensBulge != 0.) {
    float rn = radius / inradius;
    float bulge = abs(u_lensBulge) * (u_lensBulge > 0. ? 1.4 : 1.2);
    if (u_lensBulge > 0.) bulgeFade = 1. - smoothstep(1.45, 1.53, rn * bulge);
    float map = u_lensBulge > 0.
      ? tan(min(rn * bulge, 1.53)) / tan(bulge)
      : atan(rn * tan(bulge)) / bulge;
    float bulgeScale = map / rn;
    fromCenter *= bulgeScale;
    r *= bulgeScale;
  }

  if (u_lensCircle > 0.) {
    vec2 dir = fromCenter / max(r, 1e-5);
    vec2 halfBox = vec2(u_imageAspectRatio, 1.) * .5;
    float rBox = min(halfBox.x / max(abs(dir.x), 1e-4), halfBox.y / max(abs(dir.y), 1e-4));
    float band = inradius * mix(.03, .2, .5 * (u_lensBulge + 1.));
    float innerEdge = inradius - band;
    float over = smoothstep(0., 1., (r - innerEdge) / band);
    float g = r + (rBox - inradius) * pow(over, 14.);
    fromCenter = dir * mix(r, g, u_lensCircle);
  }

  return fromCenter;
}

void main() {
  vec2 uv = v_imageUV;

  float invAspect = 1. / u_imageAspectRatio;
  float inradius = boxInradius();
  float outradius = boxOutradius();
  float reach = spreadReach();

  vec2 fromCenter = uv - .5;
  fromCenter.x *= u_imageAspectRatio;
  float radius = length(fromCenter);

  float bulgeFade;
  vec2 warpedFromCenter = lensWarp(fromCenter, radius, inradius, bulgeFade);
  vec2 baseUV = vec2(warpedFromCenter.x * invAspect, warpedFromCenter.y) + .5;

  vec2 baseDerivative = fwidth(baseUV);
  float edgeAA = clamp(2. * max(baseDerivative.x, baseDerivative.y), .001, .02);

  float spreadStrength;
  vec2 spreadAxis = getSpread(fromCenter, radius, baseUV, edgeAA, inradius, outradius, reach, spreadStrength);

  vec2 grainUV = vec2(0.);
  if (u_grainMixer > 0. || u_grainOverlay > 0.) {
    vec2 dudx = dFdx(v_imageUV);
    vec2 dudy = dFdy(v_imageUV);
    grainUV = (v_imageUV - .5) * (.8 / vec2(length(dudx), length(dudy))) + .5;
  }

  if (u_grainMixer > 0.) {
    float grainSeed = valueNoise(grainUV);
    vec2 jit = fract(grainSeed * vec2(157.31, 113.57)) * 2. - 1.;
    spreadAxis += jit * .3 * u_grainMixer * length(spreadAxis);
  }

  float count = floor(u_count);
  int countInteger = int(count);

  float invCount = 1. / count;
  float invSpan = 1. / max(count - 1., 1.);
  float hueBase = u_dispersionColor + .5;
  float biasPower = 1. + 2. * abs(u_bias);
  vec2 tapBias = .5 - vec2(u_imageX, u_imageY);

  float centerAmount = clamp(1. - u_dispersionShift, 0., 1.);
  float edgesAmount = clamp(1. + u_dispersionShift, 0., 1.);
  float dispersion = u_dispersion * mix(edgesAmount, centerAmount, innerCircleMask(radius, inradius));
  float dispersionPower = pow(dispersion, .8);

  float warpedRadius = length(warpedFromCenter);
  float swirlAngle = u_swirl * .4 * PI * spreadStrength * u_spread * min(1., inradius / max(warpedRadius, 1e-4));

  vec3 colorSum = vec3(0.);
  vec3 weightSum = vec3(0.);
  float coverSum = 0.;

  for (int i = 0; i < ${pr.maxSamples}; i++) {
    if (i >= countInteger) break;

    float layer = float(i);
    float hue = hueBase + layer * invCount;

    float spread = layer * invSpan;
    if (u_bias != 0.) spread = dispersionCurve(spread, biasPower);

    // mix(axis, -axis, spread) is axis scaled by the signed position along the fan
    float fanPos = 1. - 2. * spread;
    vec2 tapUV = baseUV + spreadAxis * fanPos - .5;

    if (u_swirl != 0.) {
      tapUV.x *= u_imageAspectRatio;
      tapUV = rotate(tapUV, swirlAngle * fanPos);
      tapUV.x *= invAspect;
    }

    vec4 tap = sampleOverWhite(tapUV + tapBias);
    vec3 weight = 1. - dispersionPower * hueColor(hue);

    colorSum += tap.rgb * weight;
    weightSum += weight;
    coverSum += tap.a;
  }

  vec3 color = colorSum / max(weightSum, 1e-4);
  float coverAvg = coverSum * invCount;

  float ground = min(color.r, min(color.g, color.b));
  float alpha = max(coverAvg, 1. - ground);
  vec3 premult = max(color - (1. - alpha), 0.);
  fragColor = vec4(premult, alpha) * bulgeFade;

  if (u_grainOverlay > 0.) {
    float grain = valueNoise(rotate(grainUV, 1.) + vec2(3.));
    grain = mix(grain, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
    grain = pow(grain, 1.3);
    float grainV = grain * 2. - 1.;
    float grainStrength = pow(u_grainOverlay * abs(grainV), .8) * fragColor.a;
    fragColor.rgb = mix(fragColor.rgb, vec3(step(0., grainV)) * fragColor.a, .35 * grainStrength);
  }
}
`});var di,fi=x(()=>{di={effect:"lens",shader:"lens-distortion",paperShaders:"0.0.82",presets:{default:{name:"Default",source:"@paper-design/shaders-react 0.0.82, lens-distortion.tsx defaultPreset (1:1)",params:{fit:"contain",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,speed:0,frame:0,spread:.6,bias:1,angle:0,perspective:.1,count:35,dispersion:1,dispersionShift:0,dispersionColor:.6,focusCenter:.8,focusEdges:1,swirl:.35,noise:0,noiseFrequency:.25,noiseOffset:0,lensBulge:0,lensCircle:0,grainMixer:0,grainOverlay:0,imageX:0,imageY:0}},loupe:{name:"Loupe",source:"examples/r0/effects.js (R0, approved at the R0 gate 30.10.2026), copied 1:1: lens-distortion base + preset A 'Loupe'. loupeSize and zoom are VITRINE-only (the R0 loupe: a round canvas 0.5 of the card width, magnifying 2.2x)",params:{speed:0,frame:0,spread:0,count:12,lensBulge:.35,lensCircle:.6,loupeSize:.5,zoom:2.2}}}}});var gi={};z(gi,{default:()=>Ar});var mi,hi,y,xr,Ar,pi=x(()=>{"use strict";ci();fi();P();Q();mi=di,hi=mi.presets.default.params,y=(t,e)=>f(t[e],f(hi[e],0)),xr={effect:"lens",shader:"lens-distortion",fragmentShader:ui,image:"required",mipmaps:["u_image"],presets:mi.presets,toUniforms(t,{image:e}){return{u_image:e,u_spread:y(t,"spread"),u_bias:y(t,"bias"),u_angle:y(t,"angle"),u_perspective:y(t,"perspective"),u_count:y(t,"count"),u_dispersion:y(t,"dispersion"),u_dispersionShift:y(t,"dispersionShift"),u_dispersionColor:y(t,"dispersionColor"),u_focusCenter:y(t,"focusCenter"),u_focusEdges:y(t,"focusEdges"),u_swirl:y(t,"swirl"),u_noise:y(t,"noise"),u_noiseFrequency:y(t,"noiseFrequency"),u_noiseOffset:y(t,"noiseOffset"),u_lensBulge:y(t,"lensBulge"),u_lensCircle:y(t,"lensCircle"),u_grainMixer:y(t,"grainMixer"),u_grainOverlay:y(t,"grainOverlay"),u_imageX:y(t,"imageX"),u_imageY:y(t,"imageY"),...R(t,hi)}}},Ar=xr});var Je=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;var je=1920*1080*4,T=class{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=Ui();uniformCache={};textureUnitMap=new Map;ownerDocument;constructor(e,i,r,o,n=0,a=0,l=2,d=je,m=[]){if(e?.nodeType===1)this.parentElement=e;else throw new Error("Paper Shaders: parent element must be an HTMLElement");if(this.ownerDocument=e.ownerDocument,!this.ownerDocument.querySelector("style[data-paper-shader]")){let b=this.ownerDocument.createElement("style");b.innerHTML=Ri,b.setAttribute("data-paper-shader",""),this.ownerDocument.head.prepend(b)}let s=this.ownerDocument.createElement("canvas");this.canvasElement=s,this.parentElement.prepend(s),this.fragmentShader=i,this.providedUniforms=r,this.mipmaps=m,this.currentFrame=a,this.minPixelRatio=l,this.maxPixelCount=d;let u=s.getContext("webgl2",{antialias:!1,depth:!1,stencil:!1,...o});if(!u)throw new Error("Paper Shaders: WebGL is not supported in this browser");this.gl=u,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setupIntersectionObserver(),this.setSpeed(n),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let e=ki(this.gl,Je,this.fragmentShader);e&&(this.program=e,this.gl.useProgram(e))};setupPositionAttribute=()=>{let e=this.gl.getAttribLocation(this.program,"a_position"),i=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,i);let r=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(r),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let e={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([i,r])=>{if(e[i]=this.gl.getUniformLocation(this.program,i),r instanceof HTMLImageElement){let o=`${i}AspectRatio`;e[o]=this.gl.getUniformLocation(this.program,o)}}),this.uniformLocations=e};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;intersectionObserver=null;isInViewport=!0;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([e])=>{if(e?.borderBoxSize[0]){let i=e.devicePixelContentBoxSize?.[0];i!==void 0&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=i.inlineSize,this.parentDevicePixelHeight=i.blockSize),this.parentWidth=e.borderBoxSize[0].inlineSize,this.parentHeight=e.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};setupIntersectionObserver=()=>{let e=this.ownerDocument.defaultView;e?.IntersectionObserver&&(this.intersectionObserver=new e.IntersectionObserver(([i])=>{this.isInViewport=i?.isIntersecting??!0,this.updateCurrentSpeed()}),this.intersectionObserver.observe(this.parentElement))};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let e=0,i=0,r=Math.max(1,window.devicePixelRatio),o=visualViewport?.scale??1;if(this.devicePixelsSupported){let s=Math.max(1,this.minPixelRatio/r);e=this.parentDevicePixelWidth*s*o,i=this.parentDevicePixelHeight*s*o}else{let s=Math.max(r,this.minPixelRatio)*o;if(this.isSafari){let u=Pi(this.ownerDocument);s*=Math.max(1,u)}e=Math.round(this.parentWidth)*s,i=Math.round(this.parentHeight)*s}let n=Math.sqrt(this.maxPixelCount)/Math.sqrt(e*i),a=Math.min(1,n),l=Math.round(e*a),d=Math.round(i*a),m=l/Math.round(this.parentWidth);(this.canvasElement.width!==l||this.canvasElement.height!==d||this.renderScale!==m)&&(this.renderScale=m,this.canvasElement.width=l,this.canvasElement.height=d,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=e=>{if(this.hasBeenDisposed)return;if(this.program===null){console.warn("Tried to render before program or gl was initialized");return}let i=e-this.lastRenderTime;this.lastRenderTime=e,this.currentSpeed!==0&&(this.currentFrame+=i*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.uniform1f(this.uniformLocations.u_time,this.currentFrame*.001),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.currentSpeed!==0?this.requestRender():this.rafId=null};requestRender=()=>{this.rafId!==null&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(e,i)=>{if(!i.complete||i.naturalWidth===0)throw new Error(`Paper Shaders: image for uniform ${e} must be fully loaded`);let r=this.textures.get(e);r&&this.gl.deleteTexture(r),this.textureUnitMap.has(e)||this.textureUnitMap.set(e,this.textureUnitMap.size);let o=this.textureUnitMap.get(e);this.gl.activeTexture(this.gl.TEXTURE0+o);let n=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,n),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,i),this.mipmaps.includes(e)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let a=this.gl.getError();if(a!==this.gl.NO_ERROR||n===null){console.error("Paper Shaders: WebGL error when uploading texture:",a);return}this.textures.set(e,n);let l=this.uniformLocations[e];if(l){this.gl.uniform1i(l,o);let d=`${e}AspectRatio`,m=this.uniformLocations[d];if(m){let s=i.naturalWidth/i.naturalHeight;this.gl.uniform1f(m,s)}}};areUniformValuesEqual=(e,i)=>e===i?!0:Array.isArray(e)&&Array.isArray(i)&&e.length===i.length?e.every((r,o)=>this.areUniformValuesEqual(r,i[o])):!1;setUniformValues=e=>{Object.entries(e).forEach(([i,r])=>{let o=r;if(r instanceof HTMLImageElement&&(o=`${r.src.slice(0,200)}|${r.naturalWidth}x${r.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[i],o))return;this.uniformCache[i]=o;let n=this.uniformLocations[i];if(!n){console.warn(`Uniform location for ${i} not found`);return}if(r instanceof HTMLImageElement)this.setTextureUniform(i,r);else if(Array.isArray(r)){let a=null,l=null;if(r[0]!==void 0&&Array.isArray(r[0])){let d=r[0].length;if(r.every(m=>m.length===d))a=r.flat(),l=d;else{console.warn(`All child arrays must be the same length for ${i}`);return}}else a=r,l=a.length;switch(l){case 2:this.gl.uniform2fv(n,a);break;case 3:this.gl.uniform3fv(n,a);break;case 4:this.gl.uniform4fv(n,a);break;case 9:this.gl.uniformMatrix3fv(n,!1,a);break;case 16:this.gl.uniformMatrix4fv(n,!1,a);break;default:console.warn(`Unsupported uniform array length: ${l}`)}}else typeof r=="number"?this.gl.uniform1f(n,r):typeof r=="boolean"?this.gl.uniform1i(n,r?1:0):console.warn(`Unsupported uniform type for ${i}: ${typeof r}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=e=>{this.currentFrame=e,this.lastRenderTime=performance.now(),this.renderUnlessAnimating()};setSpeed=(e=1)=>{this.speed=e,this.updateCurrentSpeed()};updateCurrentSpeed=()=>{this.setCurrentSpeed(this.ownerDocument.hidden||!this.isInViewport?0:this.speed)};setCurrentSpeed=e=>{this.currentSpeed=e,this.rafId===null&&e!==0&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),this.rafId!==null&&e===0&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(e=je)=>{this.maxPixelCount=e,this.handleResize()};setMinPixelRatio=(e=2)=>{this.minPixelRatio=e,this.handleResize()};setUniforms=e=>{this.setUniformValues(e),this.providedUniforms={...this.providedUniforms,...e},this.renderUnlessAnimating()};renderUnlessAnimating=()=>{this.rafId===null&&this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.updateCurrentSpeed()};dispose=()=>{this.hasBeenDisposed=!0,this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(e=>{this.gl.deleteTexture(e)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.gl.getExtension("WEBGL_lose_context")?.loseContext(),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.ownerDocument.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}};function Ze(t,e,i){let r=t.createShader(e);return r?(t.shaderSource(r,i),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS)?r:(console.error("An error occurred compiling the shaders: "+t.getShaderInfoLog(r)),t.deleteShader(r),null)):null}function ki(t,e,i){let r=t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT),o=r?r.precision:null;o&&o<23&&(e=e.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),i=i.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let n=Ze(t,t.VERTEX_SHADER,e),a=Ze(t,t.FRAGMENT_SHADER,i);if(!n||!a)return null;let l=t.createProgram();return l?(t.attachShader(l,n),t.attachShader(l,a),t.linkProgram(l),t.getProgramParameter(l,t.LINK_STATUS)?(t.detachShader(l,n),t.detachShader(l,a),t.deleteShader(n),t.deleteShader(a),l):(console.error("Unable to initialize the shader program: "+t.getProgramInfoLog(l)),t.deleteProgram(l),t.deleteShader(n),t.deleteShader(a),null)):null}var Ri=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;function Ui(){let t=navigator.userAgent.toLowerCase();return t.includes("safari")&&!t.includes("chrome")&&!t.includes("android")}function Pi(t){let e=visualViewport?.scale??1,i=visualViewport?.width??window.innerWidth,r=window.innerWidth-t.documentElement.clientWidth,o=e*i+r,n=outerWidth/o,a=Math.round(100*n);return a%5===0?a/100:a===33?1/3:a===67?2/3:a===133?4/3:n}var G=[],Fi=0,ae=!1,we=!1;function $e(t){if(!t||typeof window>"u")return!0;let e=t.getBoundingClientRect(),i=window.innerHeight||document.documentElement.clientHeight,r=window.innerWidth||document.documentElement.clientWidth,o=i*.5;return e.bottom>=-o&&e.top<=i+o&&e.right>=0&&e.left<=r}function Vi(t){if(typeof requestAnimationFrame>"u"){setTimeout(t,0);return}requestAnimationFrame(()=>setTimeout(t,0))}function Ii(t){let e=globalThis.requestIdleCallback;typeof e=="function"?e(t,{timeout:2e3}):setTimeout(t,50)}function et(){if(ae||we||G.length===0)return;we=!0,(G.some(e=>$e(e.el))?Vi:Ii)(()=>{if(we=!1,ae||G.length===0)return;let e=G.findIndex(r=>$e(r.el));e<0&&(e=0);let[i]=G.splice(e,1);ae=!0,i.grant()})}function tt(t){return new Promise(e=>{let i={el:t,seq:Fi++,grant:()=>{let r=!1;e(()=>{r||(r=!0,ae=!1,et())})}};G.push(i),et()})}var Di={maxLive:6,debug:!1,bakeIdleMs:1500,minPixelRatio:2,maxPixelCount:void 0},N={...Di};function Ti(){if(typeof document>"u")return{};let t=document.documentElement.dataset,e={},i=Number(t.vitrineMaxLive);return Number.isInteger(i)&&i>0&&(e.maxLive=i),t.vitrineDebug!==void 0&&(e.debug=!0),e}var it=!1;function U(){return it||(it=!0,N={...N,...Ti()}),N}function rt(t){U();let e={...N};return t.maxLive!==void 0&&Number.isInteger(t.maxLive)&&t.maxLive>0&&(e.maxLive=t.maxLive),t.debug!==void 0&&(e.debug=!!t.debug),t.bakeIdleMs!==void 0&&Number.isFinite(t.bakeIdleMs)&&t.bakeIdleMs>=0&&(e.bakeIdleMs=t.bakeIdleMs),t.minPixelRatio!==void 0&&Number.isFinite(t.minPixelRatio)&&t.minPixelRatio>0&&(e.minPixelRatio=t.minPixelRatio),"maxPixelCount"in t&&(e.maxPixelCount=t.maxPixelCount!==void 0&&Number.isFinite(t.maxPixelCount)&&t.maxPixelCount>0?t.maxPixelCount:void 0),N=e,N}var Li=`
onmessage = async (e) => {
  const { id, w, h, buf } = e.data;
  try {
    const row = w * 4;
    const src = new Uint8ClampedArray(buf);
    const out = new Uint8ClampedArray(src.length);
    for (let y = 0; y < h; y++) out.set(src.subarray(y * row, (y + 1) * row), (h - 1 - y) * row);
    const canvas = new OffscreenCanvas(w, h);
    canvas.getContext('2d').putImageData(new ImageData(out, w, h), 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    postMessage({ id, blob });
  } catch (err) {
    postMessage({ id, error: String(err) });
  }
};
`,I=null,se=!1,Oi=1,Z=new Map;function Qi(t){se=!0,I?.terminate(),I=null;for(let e of Z.values())e.reject(new Error(t));Z.clear()}function zi(){if(se)return null;if(I)return I;if(typeof Worker>"u"||typeof OffscreenCanvas>"u"||typeof URL>"u"||typeof Blob>"u")return se=!0,null;try{let t=URL.createObjectURL(new Blob([Li],{type:"text/javascript"}));I=new Worker(t),URL.revokeObjectURL(t),I.onmessage=e=>{let i=Z.get(e.data.id);i&&(Z.delete(e.data.id),e.data.blob?i.resolve(e.data.blob):i.reject(new Error(e.data.error??"encode failed")))},I.onerror=()=>Qi("encode worker failed")}catch{se=!0,I=null}return I}function Gi(t,e,i,r){let o=e*4,n=new Uint8ClampedArray(o*i);for(let u=0;u<i;u++)n.set(t.subarray(u*o,(u+1)*o),(i-1-u)*o);(r.width!==e||r.height!==i)&&(r.width=e,r.height=i);let a=r.getContext("2d",{willReadFrequently:!0});if(!a)throw new Error("2D canvas unavailable");a.putImageData(new ImageData(n,e,i),0,0);let l=r.toDataURL("image/png"),d=l.indexOf(","),m=atob(l.slice(d+1)),s=new Uint8Array(m.length);for(let u=0;u<m.length;u++)s[u]=m.charCodeAt(u);return new Blob([s],{type:"image/png"})}async function ot(t,e,i,r){let o=zi();if(o){let n=t.slice();try{return{blob:await new Promise((l,d)=>{let m=Oi++;Z.set(m,{resolve:l,reject:d}),o.postMessage({id:m,w:e,h:i,buf:n.buffer},[n.buffer])}),path:"worker"}}catch{}}return{blob:Gi(t,e,i,r()),path:"main"}}var le=class{#e=new Map;#t;#r;constructor(e,i){this.#t=Math.max(1,e),this.#r=i}get size(){return this.#e.size}get(e){let i=this.#e.get(e);return i!==void 0&&(this.#e.delete(e),this.#e.set(e,i)),i}set(e,i){for(this.#e.has(e)&&this.#e.delete(e),this.#e.set(e,i);this.#e.size>this.#t;){let r=this.#e.keys().next().value,o=this.#e.get(r);this.#e.delete(r),this.#r?.(o,r)}}delete(e){let i=this.#e.get(e);i!==void 0&&(this.#e.delete(e),this.#r?.(i,e))}clear(){for(let[e,i]of this.#e)this.#r?.(i,e);this.#e.clear()}};function nt(t,e,i){let r=null;try{let o=e*i*4;if(r=t.createBuffer(),!r)return null;t.bindBuffer(t.PIXEL_PACK_BUFFER,r),t.bufferData(t.PIXEL_PACK_BUFFER,o,t.STREAM_READ),t.readPixels(0,0,e,i,t.RGBA,t.UNSIGNED_BYTE,0),t.bindBuffer(t.PIXEL_PACK_BUFFER,null);let n=t.fenceSync(t.SYNC_GPU_COMMANDS_COMPLETE,0);return!n||t.getError()!==t.NO_ERROR?(n&&t.deleteSync(n),t.deleteBuffer(r),null):(t.flush(),{gl:t,pbo:r,sync:n,bytes:o})}catch{try{t.bindBuffer(t.PIXEL_PACK_BUFFER,null),r&&t.deleteBuffer(r)}catch{}return null}}var Ni=4,Wi=5e3;async function at(t,e){let{gl:i,pbo:r,sync:o}=t,n=performance.now();try{for(;;){if(await new Promise(l=>setTimeout(l,Ni)),i.isContextLost())throw new Error("baker context lost during readback");let a=i.clientWaitSync(o,0,0);if(a===i.ALREADY_SIGNALED||a===i.CONDITION_SATISFIED)break;if(a===i.WAIT_FAILED)throw new Error("fence wait failed");if(performance.now()-n>Wi)break}i.bindBuffer(i.PIXEL_PACK_BUFFER,r),i.getBufferSubData(i.PIXEL_PACK_BUFFER,0,e,0,t.bytes),i.bindBuffer(i.PIXEL_PACK_BUFFER,null)}finally{i.isContextLost()||(i.deleteSync(o),i.deleteBuffer(r))}}ee();var te=class t{static#e=new Map;static for(e,i=null){let r=i?.key??e.effect,o=t.#e.get(r);return o||(o=new t(e,i?.fragmentShader??e.fragmentShader,r),t.#e.set(r,o)),o}static activeContexts(){let e=0;for(let i of t.#e.values())i.#a&&(e+=1);return e}static disposeAll(){for(let e of t.#e.values())e.#x()}#t;#r;#o;#i=null;#a=null;#s=!1;#f=0;#c=0;#h=Promise.resolve();#n=null;#u=null;#l(){return this.#u??=document.createElement("canvas"),this.#u}constructor(e,i,r){this.#t=e,this.#r=i,this.#o=r}bake(e){let i=this.#h.then(()=>this.#g(e));return this.#h=i.catch(()=>{}),i}async#g(e){let i=performance.now();this.#n&&(clearTimeout(this.#n),this.#n=null);let r=Math.max(1,Math.round(e.cssWidth)),o=Math.max(1,Math.round(e.cssHeight)),n=this.#a;!n||this.#s?(this.#x(),n=this.#p(e,r,o),await D()):(r!==this.#f||o!==this.#c)&&(this.#d(r,o),await D());let a=await tt(e.el??null),l,d,m,s,u,b=performance.now();try{if(this.#s||n!==this.#a)throw new Error("baker context lost during bake");n.setUniforms(e.uniforms),n.setFrame(e.frame),d=performance.now();let M=n.canvasElement,v=M.getContext("webgl2");if(!v)throw new Error("baker lost its WebGL2 context");s=M.width,u=M.height,l=new Uint8ClampedArray(s*4*u),m=nt(v,s,u),m||v.readPixels(0,0,s,u,v.RGBA,v.UNSIGNED_BYTE,l)}finally{a()}let w=performance.now();m&&await at(m,l);let h=performance.now(),{blob:A,path:g}=await ot(l,s,u,()=>this.#l()),C=performance.now();return this.#b(),{blob:A,pixelWidth:s,pixelHeight:u,ms:C-i,msWait:b-i,msRender:h-b,msBlob:C-h,msMain:w-b+(g==="main"?C-h:0),msUpload:d-b,msRead:w-d,msGpu:h-w,readback:m?"async":"sync",encode:g}}#p(e,i,r){let o=document.createElement("div");o.setAttribute("data-vitrine-baker",this.#o),o.setAttribute("aria-hidden","true"),o.style.cssText="position:fixed;left:-10000px;top:0;pointer-events:none;visibility:hidden;contain:strict;",document.body.appendChild(o),this.#i=o,this.#d(i,r);let n=U(),a=new T(o,this.#r,e.uniforms,void 0,0,e.frame,n.minPixelRatio,n.maxPixelCount,this.#t.mipmaps);return this.#s=!1,a.canvasElement.addEventListener("webglcontextlost",()=>{this.#s=!0}),this.#a=a,a}#d(e,i){this.#i&&(this.#f=e,this.#c=i,this.#i.style.width=`${e}px`,this.#i.style.height=`${i}px`)}#b(){let e=U().bakeIdleMs;this.#n=setTimeout(()=>{this.#n=null,this.#x()},e)}#x(){if(this.#n&&(clearTimeout(this.#n),this.#n=null),this.#a){try{this.#a.dispose()}catch{}this.#a=null}this.#i?.remove(),this.#i=null,this.#f=0,this.#c=0,this.#s=!1}},ie=new le(96,t=>{t.then(e=>URL.revokeObjectURL(e)).catch(()=>{})});var mt={kind:"none"};function ht(t){if(typeof t!="string")return null;let e=t.trim();if(!/^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(e))return null;let i=Date.parse(e.replace(" ","T"));return Number.isFinite(i)?i:null}function ue(t,e){let i=ht(e);if(i===null)return null;let r=!(t==null||t===""),o=r?ht(t):null;return r&&o===null?null:{kind:"date",to:i,from:o!==null&&o<i?o:null}}function Be(t){if(t===null)return mt;let e=t.trim();if(e===""||e==="none")return mt;if(e==="pointer")return{kind:"pointer"};if(e.startsWith("{")){let i;try{i=JSON.parse(e)}catch{return null}if(i&&typeof i=="object"){let r=i;if(r.pointer===!0)return{kind:"pointer"};let o=r.date;if(typeof o=="string")return ue(null,o);if(o&&typeof o=="object"){let n=o;return ue(n.from,n.to)}}return null}if(e.startsWith("date:")){let i=e.slice(5).trim(),r=i.indexOf("/");return r===-1?ue(null,i):ue(i.slice(0,r),i.slice(r+1))}return null}function Yi(t,e){return e?`date:${e}/${t}`:`date:${t}`}var gt=864e5,vt=[{days:30,preset:"preorder-30"},{days:7,preset:"preorder-7"},{days:1,preset:"preorder-1"}],Hi=["distortion","blur","stretch","highlights","shadows","grainOverlay"];function Me(t,e,i){let r=(t.to-i)/gt,o=t.from===null?1/0:(t.to-t.from)/gt,n=Math.min(1,o/30);if(r<=0)return{daysLeft:r,scale:30*n,clear:!0,params:{}};let a=vt.map(h=>({days:h.days*n,params:e[h.preset]?.params??{}})),l=a[0],d=a[a.length-1];if(t.from!==null&&i<t.from||r>=l.days)return{daysLeft:r,scale:l.days,clear:!1,params:{...l.params}};let s=d,u=null,b=r/d.days;for(let h=0;h<a.length-1;h++){let A=a[h],g=a[h+1];if(r<=A.days&&r>=g.days){u=A,s=g,b=(r-g.days)/(A.days-g.days);break}}let w={...s.params};for(let h of Hi){let A=pt(s.params[h],0),g=u?pt(u.params[h],0):0;w[h]=u?A+(g-A)*b:A*b}return{daysLeft:r,scale:l.days,clear:!1,params:w}}function pt(t,e){return typeof t=="number"&&Number.isFinite(t)?t:e}var br={dither:()=>Promise.resolve().then(()=>(_t(),Mt)),halftone:()=>Promise.resolve().then(()=>(Tt(),Dt)),mesh:()=>Promise.resolve().then(()=>(Yt(),Wt)),paper:()=>Promise.resolve().then(()=>(Zt(),jt)),glass:()=>Promise.resolve().then(()=>(li(),si)),lens:()=>Promise.resolve().then(()=>(pi(),gi))},vi=new Map,xi=["dither","halftone","mesh","paper","glass","lens"];function Ge(t){return t!==null&&xi.includes(t)}function Ai(t){let e=vi.get(t);return e||(e=br[t]().then(i=>i.default),vi.set(t,e)),e}P();var X=class{#e=new Map;#t=0;#r;constructor(e){this.#r=e}get size(){return this.#e.size}has(e){return this.#e.has(e)}acquire(e,i){let r=this.#e.get(e);if(r)return r.t=++this.#t,[];let o=[],n=Math.max(1,this.#r());for(;this.#e.size>=n;){let a,l=1/0;for(let[m,s]of this.#e)s.t<l&&(l=s.t,a=m);if(a===void 0)break;let d=this.#e.get(a);this.#e.delete(a),d.onEvict(),o.push(a)}return this.#e.set(e,{...i,t:++this.#t}),o}release(e){return this.#e.delete(e)}keys(){return[...this.#e.keys()]}};ee();var J=new X(()=>1),wr=520,yr=380,bi=350,Er=250,Ei=400,Cr=t=>1-Math.pow(1-t,3);function wi(t,e,i){let r=getComputedStyle(t).getPropertyValue(e).trim();if(!r)return i;let o=r.endsWith("ms")?parseFloat(r):r.endsWith("s")?parseFloat(r)*1e3:parseFloat(r);return Number.isFinite(o)&&o>=0?o:i}function Ci(t,e,i){let r=U();return new T(t,e.fragmentShader,{...e.uniforms,...i},void 0,0,0,r.minPixelRatio,r.maxPixelCount,e.mipmaps)}function Si(t){try{t?.dispose()}catch{}}var pe=class{constructor(e,i,r){this.apply=i;this.done=r;this.value=e}apply;done;value;#e=0;#t=0;#r=0;#o=0;#i=0;get running(){return this.#i!==0}to(e,i){this.#e=this.value,this.#t=e,this.#r=performance.now(),this.#o=i,this.#i||(this.#i=requestAnimationFrame(this.#a))}stop(){this.#i&&cancelAnimationFrame(this.#i),this.#i=0}#a=e=>{let i=this.#o>0?Math.min(1,(e-this.#r)/this.#o):1;this.value=this.#e+(this.#t-this.#e)*Cr(i),this.apply(this.value),i<1?this.#i=requestAnimationFrame(this.#a):(this.#i=0,this.done(this.value))}},ve=class{#e;#t;#r=0;#o=null;#i=null;#a=!1;#s=null;#f=!1;constructor(e){this.#e=e,this.#t=new pe(0,i=>this.#n(i),i=>this.#u(i)),this.#g(0)}get value(){return this.#t.value}get live(){return this.#o!==null}set(e){if(this.#f)return;let i=e?1:0;if(this.#r=i,this.#e.reducedMotion()){this.#l(i);return}if(this.#t.value===i&&!this.#t.running)return;this.#d(),J.acquire(this,{onEvict:()=>this.#l(this.#r)});let r=this.#c(i);if(this.#o&&this.#a){this.#t.to(i,r);return}this.#o||this.#h()}#c(e){return e===1?wi(this.#e.el,"--vitrine-glass-open",wr):wi(this.#e.el,"--vitrine-glass-close",yr)}dispose(){this.#f=!0,this.#t.stop(),this.#d(),this.#p()}#h(){let e=this.#e.el.ownerDocument.createElement("div");e.className="vitrine-live",e.style.visibility="hidden",this.#e.layer.appendChild(e),this.#i=e,this.#e.layer.style.visibility="";let i;try{i=Ci(e,this.#e,{u_marginLeft:this.#t.value})}catch{this.#p(),this.#l(this.#r);return}this.#o=i,this.#a=!1,this.#e.onLive?.(!0),i.canvasElement.addEventListener("webglcontextlost",r=>{r.preventDefault(),this.#o===i&&this.#l(this.#r)}),D().then(()=>{this.#o!==i||this.#f||(this.#a=!0,i.setUniforms({u_marginLeft:this.#t.value}),e.style.visibility="",this.#e.baked.style.visibility="hidden",this.#t.to(this.#r,this.#c(this.#r)))})}#n(e){this.#o?.setUniforms({u_marginLeft:e})}#u(e){e!==0&&e!==1||(this.#g(e),this.#d(),this.#s=setTimeout(()=>{this.#s=null,this.#p()},Ei))}#l(e){this.#t.stop(),this.#t.value=e,this.#d(),this.#p(),this.#g(e)}#g(e){this.#e.layer.style.visibility=e>=1?"hidden":"",this.#e.baked.style.visibility=e>=1?"hidden":"",this.#i&&(this.#i.style.visibility="hidden"),this.#e.el.toggleAttribute("data-vitrine-open",e>=1)}#p(){let e=this.#o!==null;Si(this.#o),this.#o=null,this.#a=!1,this.#i?.remove(),this.#i=null,J.release(this),e&&this.#e.onLive?.(!1)}#d(){this.#s&&clearTimeout(this.#s),this.#s=null}};function yi(t,e,i){let r=Math.max(t/i,e)*i;return{x:r,y:r/i}}function Sr(t){let e=yi(t.cellW,t.cellH,t.aspect),i=yi(t.L,t.L,t.aspect),r=t.zoom*e.x/i.x;return{scale:r,offsetX:-r*(t.cx-t.cellW/2)/e.x,offsetY:-r*(t.cy-t.cellH/2)/e.y}}var Br=350,Mr=10,xe=class{#e;#t=null;#r=null;#o=!1;#i;#a=0;#s=0;#f=0;#c=null;#h=null;#n=null;#u=null;#l=!1;#g;constructor(e){this.#e=e,this.#i=new pe(0,()=>this.#A(),i=>{i===0&&this.#S()}),this.#g=this.#p()}get live(){return this.#t!==null}dispose(){this.#g(),this.#i.stop(),this.#d(),this.#f&&cancelAnimationFrame(this.#f),this.#f=0,this.#m()}#p(){let e=this.#e.el,i=s=>{let u=e.getBoundingClientRect();return{x:s.clientX-u.left,y:s.clientY-u.top}},r=s=>{if(s.pointerType==="touch")return;let u=i(s);this.#b(u.x,u.y)},o=s=>{let u=i(s);if(s.pointerType==="touch"){if(this.#n&&s.pointerId===this.#n.id&&Math.hypot(u.x-this.#n.x,u.y-this.#n.y)>Mr&&this.#d(),this.#u!==s.pointerId)return}else if(!this.#l){this.#b(u.x,u.y);return}this.#E(u.x,u.y)},n=s=>{s.pointerType!=="touch"&&this.#x()},a=s=>{if(s.pointerType!=="touch")return;let u=i(s);this.#d(),this.#n={...u,id:s.pointerId},this.#h=setTimeout(()=>{this.#h=null,this.#n&&(this.#u=this.#n.id,this.#b(this.#n.x,this.#n.y))},Br)},l=s=>{s.pointerType==="touch"&&(this.#d(),this.#u===s.pointerId&&(this.#u=null,this.#x()))},d=s=>{this.#u!==null&&s.preventDefault()},m=s=>{(this.#u!==null||this.#n)&&s.preventDefault()};return e.addEventListener("pointerenter",r),e.addEventListener("pointermove",o),e.addEventListener("pointerleave",n),e.addEventListener("pointerdown",a),e.addEventListener("pointerup",l),e.addEventListener("pointercancel",l),e.addEventListener("touchmove",d,{passive:!1}),e.addEventListener("contextmenu",m),()=>{e.removeEventListener("pointerenter",r),e.removeEventListener("pointermove",o),e.removeEventListener("pointerleave",n),e.removeEventListener("pointerdown",a),e.removeEventListener("pointerup",l),e.removeEventListener("pointercancel",l),e.removeEventListener("touchmove",d),e.removeEventListener("contextmenu",m)}}#d(){this.#h&&clearTimeout(this.#h),this.#h=null,this.#n=null}#b(e,i){this.#a=e,this.#s=i,this.#l=!0,this.#c&&clearTimeout(this.#c),this.#c=null,J.acquire(this,{onEvict:()=>this.#y()}),this.#t?this.#o&&this.#i.to(1,this.#e.reducedMotion()?0:bi):this.#C()}#x(){if(this.#l=!1,!!this.#t){if(!this.#o){this.#m();return}this.#i.to(0,this.#e.reducedMotion()?0:Er)}}#E(e,i){this.#a=e,this.#s=i,this.#f||(this.#f=requestAnimationFrame(()=>{this.#f=0,this.#A()}))}#C(){let e=this.#e.el.ownerDocument.createElement("div");e.className="vitrine-loupe",e.style.visibility="hidden",this.#e.layer.appendChild(e),this.#r=e;let i=this.#v();e.style.width=`${i}px`,e.style.height=`${i}px`;let r;try{r=Ci(e,this.#e,this.#M(.001))}catch{this.#m();return}this.#t=r,this.#o=!1,this.#e.onLive?.(!0),r.canvasElement.addEventListener("webglcontextlost",o=>{o.preventDefault(),this.#t===r&&this.#m()}),D().then(()=>{this.#t===r&&(this.#o=!0,e.style.visibility="",this.#A(),this.#l?this.#i.to(1,this.#e.reducedMotion()?0:bi):this.#i.to(0,0))})}#v(){return Math.max(24,Math.round(this.#e.el.getBoundingClientRect().width*this.#e.size))}#M(e){let i=this.#e.el.getBoundingClientRect(),r=this.#v(),o=1+(this.#e.zoom-1)*e,n=Sr({cellW:i.width,cellH:i.height,aspect:this.#e.aspect,L:r,cx:this.#a,cy:this.#s,zoom:o/Math.max(e,.001)});return{u_fit:2,u_scale:n.scale,u_offsetX:n.offsetX,u_offsetY:n.offsetY,u_lensBulge:this.#e.lensBulge*e}}#A(){let e=this.#r;if(!e||!this.#t||!this.#o)return;let i=Math.max(this.#i.value,.001),r=this.#v();e.style.transform=`translate(${(this.#a-r/2).toFixed(2)}px, ${(this.#s-r/2).toFixed(2)}px) scale(${i.toFixed(4)})`,e.style.opacity=this.#i.value<.02?"0":"1",this.#t.setUniforms(this.#M(i))}#S(){this.#l||(this.#c&&clearTimeout(this.#c),this.#c=setTimeout(()=>{this.#c=null,this.#l||this.#m()},Ei))}#y(){this.#i.stop(),this.#i.value=0,this.#l=!1,this.#m()}#m(){let e=this.#t!==null;Si(this.#t),this.#t=null,this.#o=!1,this.#r?.remove(),this.#r=null,J.release(this),e&&this.#e.onLive?.(!1)}};P();var Ne="data-vitrine-revealed";function _r(t){return t.closest("[data-vitrine-card]")??t.closest("a")??t}function We(t,e={}){let i=e.mode??"hover",r=_r(t),o=c=>c instanceof Element&&c.closest("a[href]")!==null,n=t.hasAttribute(Ne),a=c=>{t.toggleAttribute(Ne,c),c!==n&&(n=c,e.onChange?.(c))},l=null,d=()=>{l&&(document.removeEventListener("pointerdown",l,!0),l=null)},m=()=>{d(),l=c=>{r.contains(c.target)||(a(!1),d())},document.addEventListener("pointerdown",l,!0)},s=!1,u=null,b=()=>{s=!0,u&&clearTimeout(u),u=setTimeout(()=>s=!1,800)},w=c=>{i!=="hover"||c.pointerType==="touch"||a(!0)},h=c=>{i!=="hover"||c.pointerType==="touch"||r.matches(":focus-within")||a(!1)},A=c=>{i!=="hover"||c.pointerType!=="touch"||(!n&&e.consumeFirstTap&&o(c.target)&&b(),a(!0),m())},g=c=>{if(s){s=!1,c.preventDefault();return}i==="tap"&&(n?o(c.target)||a(!1):(o(c.target)&&c.preventDefault(),a(!0),m()))},C=c=>{c.key!=="Enter"&&c.key!==" "||c.target!==r||o(r)||c.repeat||(c.key===" "&&c.preventDefault(),a(!n))},M=()=>{i==="hover"&&a(!0)},v=c=>{c.relatedTarget instanceof Node&&r.contains(c.relatedTarget)||(i==="tap"||!r.matches(":hover"))&&a(!1)};return r.addEventListener("pointerenter",w),r.addEventListener("pointerleave",h),r.addEventListener("pointerdown",A),r.addEventListener("click",g),r.addEventListener("keydown",C),r.addEventListener("focusin",M),r.addEventListener("focusout",v),i==="hover"&&(r.matches(":focus-within")||r.matches(":hover"))&&a(!0),()=>{r.removeEventListener("pointerenter",w),r.removeEventListener("pointerleave",h),r.removeEventListener("pointerdown",A),r.removeEventListener("click",g),r.removeEventListener("keydown",C),r.removeEventListener("focusin",M),r.removeEventListener("focusout",v),u&&clearTimeout(u),d(),t.toggleAttribute(Ne,!1),n=!1}}var kr=`
vitrine-shader{display:block;position:relative;isolation:isolate;aspect-ratio:var(--vitrine-aspect,auto)}
:where(vitrine-shader>img){display:block;max-width:100%}
vitrine-shader>.vitrine-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:1;transition:opacity var(--vitrine-reveal-duration,320ms) var(--vitrine-reveal-ease,cubic-bezier(.2,0,0,1))}
vitrine-shader:not([effect="glass"])[data-vitrine-revealed]>.vitrine-layer{opacity:0}
vitrine-shader>.vitrine-layer>img,vitrine-shader>.vitrine-layer>canvas.vitrine-parked,vitrine-shader>.vitrine-layer>.vitrine-live{display:block;position:absolute;inset:0;width:100%;height:100%}
vitrine-shader[effect="glass"]{overflow:hidden}
vitrine-shader[effect="glass"]>.vitrine-layer{transition:none}
vitrine-shader[effect="glass"]>img{transform:scale(var(--vitrine-image-scale,1))}
vitrine-shader[effect="lens"]{overflow:hidden;-webkit-touch-callout:none}
vitrine-shader[effect="lens"]>img{-webkit-touch-callout:none;-webkit-user-drag:none}
vitrine-shader>.vitrine-layer>.vitrine-loupe{position:absolute;left:0;top:0;border-radius:50%;overflow:hidden;transform-origin:50% 50%;box-shadow:0 0 0 1px rgba(20,19,18,.28)}
vitrine-shader[data-vitrine-state="fallback"]>.vitrine-layer{display:none}
@media (prefers-reduced-motion:reduce){vitrine-shader>.vitrine-layer{transition:none}}
`;function Bi(t){if(t.querySelector("style[data-vitrine]"))return;let e=t.createElement("style");e.setAttribute("data-vitrine",""),e.textContent=kr,t.head.prepend(e)}ee();var Ae="vitrine-shader",j=new X(()=>U().maxLive),Mi=null,ne=null;function Ye(){return typeof matchMedia>"u"?!1:(ne??=matchMedia("(prefers-reduced-motion: reduce)"),ne.matches)}var He=null,Ke=new WeakMap;function Rr(t,e){return He??=new IntersectionObserver(i=>{for(let r of i)Ke.get(r.target)?.(r.isIntersecting)},{rootMargin:"0px",threshold:0}),Ke.set(t,e),He.observe(t),()=>{He?.unobserve(t),Ke.delete(t)}}var Ur=typeof HTMLElement>"u"?class{}:HTMLElement,be=class extends Ur{static tag=Ae;static get observedAttributes(){return["effect","preset","params","reveal","bind","speed","debug"]}static config(e){return e?rt(e):U()}static stats(){return{liveMounts:j.size,bakerContexts:te.activeContexts(),bakedCached:ie.size,interactionMounts:J.size}}#e=null;#t=0;#r=0;#o=!1;#i=null;#a="idle";#s=null;#f="";#c=null;#h=0;#n=0;#u=null;#l=null;#g=null;#p=0;#d=!1;#b=null;#x=null;#E=null;#C=null;#v=null;#M="";#A=null;#S=null;connectedCallback(){Bi(this.ownerDocument),this.#r=performance.now(),this.#d=!1,this.#S??=()=>this.#y(),typeof matchMedia<"u"&&(ne??=matchMedia("(prefers-reduced-motion: reduce)"),ne.addEventListener("change",this.#S)),this.#y()}disconnectedCallback(){this.#t+=1,this.#S&&ne?.removeEventListener("change",this.#S),this.#R()}attributeChangedCallback(){this.isConnected&&this.#y()}get mode(){return this.#i}get state(){return this.#a}#y(){this.#o||(this.#o=!0,queueMicrotask(()=>{this.#o=!1,this.isConnected&&this.#I()}))}#m(){return this.hasAttribute("debug")||U().debug}#k(e){this.#a=e,this.setAttribute("data-vitrine-state",e)}#B(){return(!this.#e||this.#e.parentElement!==this)&&(this.#e=this.querySelector(":scope > .vitrine-layer"),this.#e||(this.#e=this.ownerDocument.createElement("div"),this.#e.className="vitrine-layer",this.#e.setAttribute("aria-hidden","true"),this.appendChild(this.#e))),this.#e}#F(){return this.querySelector(":scope > img")}#R(){this.#E?.(),this.#E=null,this.#b?.dispose(),this.#b=null,this.#x?.dispose(),this.#x=null,this.removeAttribute("data-vitrine-open"),this.#C?.disconnect(),this.#C=null,this.#v&&clearTimeout(this.#v),this.#v=null,this.#A?.disconnect(),this.#A=null,this.#g?.(),this.#g=null,this.#P(),this.#l?.remove(),this.#l=null,j.release(this)}#w(e,i){this.#R(),this.#e?.replaceChildren(),this.#i=null,this.#k("fallback"),this.#m()&&console.warn(`[vitrine-shader] fallback (${e}): ${i}`,this);let r={reason:e,message:i};this.dispatchEvent(new CustomEvent("vitrine:fallback",{bubbles:!0,detail:r}))}#_(e,i,r,o,n){if(this.#i=e,this.#k(e),this.#d)return;this.#d=!0;let a={effect:i.effect,preset:r,mode:e,cached:o,ms:Math.round(performance.now()-this.#r),...n?{bake:n}:{}};this.dispatchEvent(new CustomEvent("vitrine:ready",{bubbles:!0,detail:a}))}async#I(){let e=++this.#t,i=()=>e===this.#t&&this.isConnected;this.#R(),this.#k("loading");let r=this.getAttribute("effect");if(!Ge(r)){this.#w("error",`unknown effect "${r??""}" (dither | halftone | mesh | paper | glass | lens)`);return}if(Mi??=dt(),!Mi){this.#w("no-webgl2","WebGL2 is not available");return}let o=this.#F();o&&this.#Q(o);let n;try{n=await Ai(r)}catch(v){i()&&this.#w("error",`effect module failed to load: ${String(v)}`);return}if(!i())return;if(n.image==="required"&&!o){this.#A=new MutationObserver(()=>{this.#F()&&(this.#A?.disconnect(),this.#A=null,this.#y())}),this.#A.observe(this,{childList:!0}),this.#m()&&console.warn("[vitrine-shader] waiting for a child <img>",this);return}let a=Re(this.getAttribute("params"));a===null&&this.#m()&&console.warn("[vitrine-shader] params is not a JSON object, ignoring it",this);let l=this.getAttribute("preset")??"default",d=Ue(n.presets,l,a??{},this.getAttribute("speed"));!d.presetKnown&&this.#m()&&console.warn(`[vitrine-shader] unknown preset "${l}" for ${n.effect}, using "default"`,this);let m=this.#D(n.effect),s=d.params;if(m.kind==="date")if(n.effect!=="glass")this.#m()&&console.warn('[vitrine-shader] bind="date" works with effect="glass" only',this);else{let v=Me(m,n.presets,Date.now());if(v.clear){this.#e?.replaceChildren(),this.#_("clear",n,d.presetId,!1);return}s={...s,...v.params,...a??{}}}let u=Ye(),b=n.effect==="glass"||n.effect==="lens",w=u||b?0:Number(s.speed??0)||0,h=Number(s.frame??0)||0,A={},g="";if(o&&n.image!=="none"){let v=await ft(o);if(!i())return;if(!v){this.#w("error","content image failed to load");return}g=o.currentSrc||o.src;try{A.image=await Se(g)}catch(c){if(!i())return;let Xe=c instanceof $?c.kind:"error";this.#w(Xe,Xe==="cors"?`no CORS headers for ${g}`:String(c));return}}else n.image==="optional"&&(A.image=await ct());if(n.loadNoise)try{A.noise=await n.loadNoise()}catch(v){i()&&this.#w("error",`noise texture: ${String(v)}`);return}if(!i())return;let C;try{C=n.toUniforms(s,A)}catch(v){this.#w("error",`parameter mapping failed: ${String(v)}`);return}if(n.effect==="glass"?this.style.setProperty("--vitrine-image-scale",String(f(s.scale,1))):this.style.removeProperty("--vitrine-image-scale"),n.effect==="lens"&&m.kind==="pointer"){this.#O(n,d.presetId,s,C,A.image);return}let M=this.#T(n.effect,m);n.effect!=="glass"&&M&&(this.#E=We(this,{mode:M})),w===0?(await this.#G(e,n,d.presetId,s,C,h,g),n.effect==="glass"&&i()&&this.#a==="baked"&&this.#L(n,C,M)):(this.#f=n.variant?.(s)?.fragmentShader??n.fragmentShader,this.#W(n,d.presetId,C,w,h))}#D(e){let i=this.getAttribute("bind"),r=Be(i);return r===null&&this.#m()&&console.warn(`[vitrine-shader] invalid bind "${i??""}"`,this),i===null||r===null?e==="lens"?{kind:"pointer"}:{kind:"none"}:r}#T(e,i){let r=this.getAttribute("reveal");return r==="hover"||r==="tap"?r:r==="none"?null:(r!==null&&this.#m()&&console.warn(`[vitrine-shader] unknown reveal "${r}"`,this),e==="glass"&&i.kind!=="date"?"hover":null)}#L(e,i,r){let o=this.#B(),n=o.querySelector(":scope > img.vitrine-baked");if(!n||!r)return;let a=new ve({el:this,layer:o,baked:n,fragmentShader:e.variant?.({})?.fragmentShader??e.fragmentShader,uniforms:i,mipmaps:e.mipmaps,reducedMotion:Ye});this.#b=a,this.#E=We(this,{mode:r,consumeFirstTap:!0,onChange:l=>a.set(l)}),this.hasAttribute("data-vitrine-revealed")&&a.set(!0)}#O(e,i,r,o,n){let a=this.#B();a.replaceChildren(),this.#x=new xe({el:this,layer:a,fragmentShader:e.fragmentShader,uniforms:o,mipmaps:e.mipmaps,aspect:n.naturalWidth/Math.max(1,n.naturalHeight),size:f(r.loupeSize,.5),zoom:f(r.zoom,2.2),lensBulge:f(r.lensBulge,0),reducedMotion:Ye}),this.#_("interactive",e,i,!1)}#Q(e){let i=Number(e.getAttribute("width")),r=Number(e.getAttribute("height"));i>0&&r>0&&this.style.setProperty("--vitrine-aspect",`${i} / ${r}`)}async#z(e){for(let r=0;r<2;r++){let o=this.getBoundingClientRect();if(o.width>=1&&o.height>=1)return{w:o.width,h:o.height};if(r===0&&await D(),!e())return null}if(await new Promise(r=>{let o=new ResizeObserver(n=>{let a=n[0]?.contentRect;a&&a.width>=1&&a.height>=1&&(o.disconnect(),r())});o.observe(this)}),!e())return null;let i=this.getBoundingClientRect();return{w:i.width,h:i.height}}async#G(e,i,r,o,n,a,l){let d=()=>e===this.#t&&this.isConnected,m=await this.#z(d);if(!m||!d())return;let s=Math.round(m.w),u=Math.round(m.h),b=Math.max(1,window.devicePixelRatio||1),w=`${i.effect}|${Pe({...o,speed:0,frame:a})}|${l}|${s}x${u}@${b}`,h=ie.get(w),A=h!==void 0,g;h||(h=te.for(i,i.variant?.(o)??null).bake({uniforms:n,frame:a,cssWidth:s,cssHeight:u,el:this}).then(c=>(g={total:Math.round(c.ms),wait:Math.round(c.msWait),render:Math.round(c.msRender),blob:Math.round(c.msBlob),main:Math.round(c.msMain),upload:Math.round(c.msUpload),read:Math.round(c.msRead),gpu:Math.round(c.msGpu),readback:c.readback,encode:c.encode,pixels:`${c.pixelWidth}x${c.pixelHeight}`},URL.createObjectURL(c.blob))),ie.set(w,h),h.catch(()=>ie.delete(w)));let C;try{C=await h}catch(c){d()&&this.#w("error",`bake failed: ${String(c)}`);return}if(!d())return;let M=this.#B(),v=this.ownerDocument.createElement("img");v.className="vitrine-baked",v.alt="",v.decoding="async",v.draggable=!1,v.src=C;try{await v.decode()}catch{}d()&&(M.replaceChildren(v),this.#_("baked",i,r,A,g),this.#M=`${s}x${u}`,this.#N())}#N(){this.#C=new ResizeObserver(()=>{this.#v&&clearTimeout(this.#v),this.#v=setTimeout(()=>{this.#v=null;let e=this.getBoundingClientRect();`${Math.round(e.width)}x${Math.round(e.height)}`!==this.#M&&e.width>=1&&e.height>=1&&this.#y()},150)}),this.#C.observe(this)}#W(e,i,r,o,n){this.#s=e,this.#c=r,this.#h=o,this.#n=n,this.#p=0,this.#B(),this.#g=Rr(this,a=>{a?this.#Y(i):this.#U()})}#Y(e){if(!(!this.#s||!this.#c)){if(this.#u){j.acquire(this,{onEvict:()=>this.#U()});return}j.acquire(this,{onEvict:()=>this.#U()}),this.#V(),this.#_("live",this.#s,e,!1)}}#V(){if(!this.#s||!this.#c)return;let e=this.#B(),i=U(),r;try{r=new T(e,this.#f,this.#c,void 0,this.#h,this.#n,i.minPixelRatio,i.maxPixelCount,this.#s.mipmaps)}catch(n){this.#w("error",`mount failed: ${String(n)}`);return}this.#u=r,r.canvasElement.addEventListener("webglcontextlost",n=>{n.preventDefault(),this.#u===r&&(this.#n=r.getCurrentFrame(),this.#P(),this.#p++<3&&j.has(this)?this.#V():this.#m()&&console.warn("[vitrine-shader] context lost repeatedly, parked",this))});let o=this.#l;o&&D().then(()=>{this.#u===r&&(o.remove(),this.#l===o&&(this.#l=null))})}#U(){let e=this.#u;if(j.release(this),!e)return;let i=this.#B();try{this.#n=e.getCurrentFrame(),e.setSpeed(0),e.setFrame(this.#n);let r=e.canvasElement;if(r.width>0&&r.height>0){let o=this.#l??this.ownerDocument.createElement("canvas");o.className="vitrine-parked",o.width=r.width,o.height=r.height,o.getContext("2d")?.drawImage(r,0,0),o.parentElement||i.appendChild(o),this.#l=o}}catch{}this.#P()}#P(){if(this.#u){try{this.#u.dispose()}catch{}this.#u=null}}};function qe(){typeof customElements>"u"||customElements.get(Ae)||customElements.define(Ae,be)}P();var Rn="0.0.82";qe();export{vt as DATE_ANCHORS,xi as EFFECTS,Rn as PAPER_SHADERS_VERSION,Ae as VITRINE_TAG,be as VitrineShader,Me as dateFrost,qe as define,Yi as formatDateBind,Pe as hashParams,Ge as isEffect,Be as parseBind,Re as parseParamsAttribute,Ue as resolveParams,fe as stableStringify};
