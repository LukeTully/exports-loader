/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
const loaderUtils = require('loader-utils');
const { SourceNode } = require('source-map');
const { SourceMapConsumer } = require('source-map');

const FOOTER = '/*** EXPORTS FROM exports-loader ***/\n';

module.exports = function loader(content, sourceMap) {
  if (this.cacheable) this.cacheable();
  const query = loaderUtils.getOptions(this) || {};
  const exports = [];
  const keys = Object.keys(query);

  // apply name interpolation i.e. substitute strings like [name] or [ext]
  for (let i = 0; i < keys.length; i++) {
    keys[i] = loaderUtils.interpolateName(this, keys[i], {});
  }

  if (keys.length === 1 && typeof query[keys[0]] === 'boolean') {
    exports.push(`module.exports = ${keys[0]};`);
  } else {
    
    /* Initialize the final export string */
    let exportString = 'export {';
    let exportKeys = [];

    /* Determine if we're using default names or custom names for our exported variable */
    keys.forEach(name => {
      let mod = name;
      if (typeof query[name] === 'string') {
        mod = query[name];
        exportKeys.push(`${name} as ${mod}`); // Use es6 'as' export syntax for custom names
      } else {
        exportKeys.push(name); // export the default variable names
      }
    });
    
    /* Join our export names and concat them to form our final export object */
    exports.push(exportString + exportKeys.join(',') + '}'); 
  }

  if (sourceMap) {
    const currentRequest = loaderUtils.getCurrentRequest(this);
    const node = SourceNode.fromStringWithSourceMap(
      content,
      new SourceMapConsumer(sourceMap)
    );
    node.add(`\n\n${FOOTER}${exports.join('\n')}`);
    const result = node.toStringWithSourceMap({
      file: currentRequest,
    });
    this.callback(null, result.code, result.map.toJSON());
    return;
  }

  // eslint-disable-next-line consistent-return
  return `${content}\n\n${FOOTER}${exports.join('\n')}`;
};
