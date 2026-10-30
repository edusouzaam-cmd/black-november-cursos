import {readFileSync,existsSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const html=readFileSync('src/content/passaporte.html','utf8');
describe('Native offer delivery',()=>{
 it('does not depend on WordPress, Elementor, iframe or third party UI runtimes',()=>{
  expect(html).not.toMatch(/elementor|wp-content|wp-includes|wp-admin|<iframe|jquery|swiper/i);
  expect(readFileSync('public/assets/offer.css','utf8')).not.toMatch(/wp-content|wp-includes|elementor|wordpress/i);
  expect(html).toContain('<main id="main-content"');
 });
 it('resolves all local resources including responsive candidates and fonts',()=>{
  for(const source of [html,readFileSync('public/assets/offer.css','utf8')]){
   for(const m of source.matchAll(/\/assets\/[\w./-]+/g))expect(existsSync('public'+m[0]),m[0]).toBe(true);
  }
 });
 it('keeps standalone fonts and SVG masks without plugin background suppression',()=>{
  const css=readFileSync('public/assets/offer.css','utf8');
  expect(css).not.toMatch(/e-lazyloaded|e-no-lazyload/);
  expect(css).toContain('poppins-400-full.woff2');
  expect(css).toContain('data:image/svg+xml');
  expect(css).toContain('font-family:var(--bn-font)!important');
 });
 it('keeps purchase links, support and the three course dialogs',()=>{
  expect(html.match(/pay\.hotmart\.com/g)?.length).toBe(3);
  expect(html).toContain('5561996502757');
  for(const course of ['pcm','gfm','rcm'])expect(html).toContain('id="bn-'+course+'-curriculum"');
  expect(html.match(/data-testimonial-slide/g)?.length).toBe(6);
 });
});
