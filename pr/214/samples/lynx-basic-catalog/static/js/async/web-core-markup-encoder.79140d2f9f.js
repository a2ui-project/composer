(self["rspackChunklynx_basic_catalog"] = self["rspackChunklynx_basic_catalog"] || []).push([[98], {
6728(__unused_rspack_module, exports, __webpack_require__) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __webpack_require__(5414);
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.C = ArraySet;


},
5873(__unused_rspack_module, exports, __webpack_require__) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = __webpack_require__(1793);

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};


},
1793(__unused_rspack_module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};


},
5923(__unused_rspack_module, exports, __webpack_require__) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = __webpack_require__(5414);

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

exports.P = MappingList;


},
3300(__unused_rspack_module, exports, __webpack_require__) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ = __webpack_require__(5873);
var util = __webpack_require__(5414);
var ArraySet = (__webpack_require__(6728)/* .ArraySet */.C);
var MappingList = (__webpack_require__(5923)/* .MappingList */.P);

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util.getArg(aArgs, 'file', null);
  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
  this._ignoreInvalidMapping = util.getArg(aArgs, 'ignoreInvalidMapping', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer, generatorOps) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator(Object.assign(generatorOps || {}, {
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    }));
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, 'generated');
    var original = util.getArg(aArgs, 'original', null);
    var source = util.getArg(aArgs, 'source', null);
    var name = util.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      if (this._validateMapping(generated, original, source, name) === false) {
        return;
      }
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
      var message = 'original.line and original.column are not numbers -- you probably meant to omit ' +
      'the original mapping entirely and only map the generated position. If so, pass ' +
      'null for the original mapping instead of an object with empty or null values.'

      if (this._ignoreInvalidMapping) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn(message);
        }
        return false;
      } else {
        throw new Error(message);
      }
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      var message = 'Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      });

      if (this._ignoreInvalidMapping) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn(message);
        }
        return false;
      } else {
        throw new Error(message)
      }
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

exports.x = SourceMapGenerator;


},
5414(__unused_rspack_module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

var MAX_CACHED_INPUTS = 32;

/**
 * Takes some function `f(input) -> result` and returns a memoized version of
 * `f`.
 *
 * We keep at most `MAX_CACHED_INPUTS` memoized results of `f` alive. The
 * memoization is a dumb-simple, linear least-recently-used cache.
 */
function lruMemoize(f) {
  var cache = [];

  return function(input) {
    for (var i = 0; i < cache.length; i++) {
      if (cache[i].input === input) {
        var temp = cache[0];
        cache[0] = cache[i];
        cache[i] = temp;
        return cache[0].result;
      }
    }

    var result = f(input);

    cache.unshift({
      input,
      result,
    });

    if (cache.length > MAX_CACHED_INPUTS) {
      cache.pop();
    }

    return result;
  };
}

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
var normalize = lruMemoize(function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);
  // Split the path into parts between `/` characters. This is much faster than
  // using `.split(/\/+/g)`.
  var parts = [];
  var start = 0;
  var i = 0;
  while (true) {
    start = i;
    i = path.indexOf("/", start);
    if (i === -1) {
      parts.push(path.slice(start));
      break;
    } else {
      parts.push(path.slice(start, i));
      while (i < path.length && path[i] === "/") {
        i++;
      }
    }
  }

  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
});
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

function compareByOriginalPositionsNoSource(mappingA, mappingB, onlyCompareOriginal) {
  var cmp

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositionsNoSource = compareByOriginalPositionsNoSource;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function compareByGeneratedPositionsDeflatedNoLine(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflatedNoLine = compareByGeneratedPositionsDeflatedNoLine;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;


},
2577(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  qu: () => (/* reexport */ lib_namespaceObject),
  qg: () => (/* reexport */ dist_parse_parse)
});

// UNUSED EXPORTS: Plugins, cssChunksToMap
// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/generator/token-before.js
var token_before_namespaceObject = {};
__webpack_require__.r(token_before_namespaceObject);
__webpack_require__.d(token_before_namespaceObject, { 
  safe: () => (safe),
  spec: () => (spec) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/lexer/units.js
var units_namespaceObject = {};
__webpack_require__.r(units_namespaceObject);
__webpack_require__.d(units_namespaceObject, { 
  angle: () => (units_angle),
  decibel: () => (units_decibel),
  flex: () => (units_flex),
  frequency: () => (units_frequency),
  length: () => (units_length),
  resolution: () => (units_resolution),
  semitones: () => (units_semitones),
  time: () => (units_time) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/lexer/trace.js
var trace_namespaceObject = {};
__webpack_require__.r(trace_namespaceObject);
__webpack_require__.d(trace_namespaceObject, { 
  getTrace: () => (getTrace),
  isKeyword: () => (isKeyword),
  isProperty: () => (isProperty),
  isType: () => (trace_isType) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/AnPlusB.js
var AnPlusB_namespaceObject = {};
__webpack_require__.r(AnPlusB_namespaceObject);
__webpack_require__.d(AnPlusB_namespaceObject, { 
  generate: () => (AnPlusB_generate),
  name: () => (AnPlusB_name),
  parse: () => (AnPlusB_parse),
  structure: () => (AnPlusB_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Atrule.js
var Atrule_namespaceObject = {};
__webpack_require__.r(Atrule_namespaceObject);
__webpack_require__.d(Atrule_namespaceObject, { 
  generate: () => (Atrule_generate),
  name: () => (Atrule_name),
  parse: () => (Atrule_parse),
  structure: () => (Atrule_structure),
  walkContext: () => (walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/AtrulePrelude.js
var AtrulePrelude_namespaceObject = {};
__webpack_require__.r(AtrulePrelude_namespaceObject);
__webpack_require__.d(AtrulePrelude_namespaceObject, { 
  generate: () => (AtrulePrelude_generate),
  name: () => (AtrulePrelude_name),
  parse: () => (AtrulePrelude_parse),
  structure: () => (AtrulePrelude_structure),
  walkContext: () => (AtrulePrelude_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/AttributeSelector.js
var AttributeSelector_namespaceObject = {};
__webpack_require__.r(AttributeSelector_namespaceObject);
__webpack_require__.d(AttributeSelector_namespaceObject, { 
  generate: () => (AttributeSelector_generate),
  name: () => (AttributeSelector_name),
  parse: () => (AttributeSelector_parse),
  structure: () => (AttributeSelector_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Block.js
var Block_namespaceObject = {};
__webpack_require__.r(Block_namespaceObject);
__webpack_require__.d(Block_namespaceObject, { 
  generate: () => (Block_generate),
  name: () => (Block_name),
  parse: () => (Block_parse),
  structure: () => (Block_structure),
  walkContext: () => (Block_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Brackets.js
var Brackets_namespaceObject = {};
__webpack_require__.r(Brackets_namespaceObject);
__webpack_require__.d(Brackets_namespaceObject, { 
  generate: () => (Brackets_generate),
  name: () => (Brackets_name),
  parse: () => (Brackets_parse),
  structure: () => (Brackets_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/CDC.js
var CDC_namespaceObject = {};
__webpack_require__.r(CDC_namespaceObject);
__webpack_require__.d(CDC_namespaceObject, { 
  generate: () => (CDC_generate),
  name: () => (CDC_name),
  parse: () => (CDC_parse),
  structure: () => (CDC_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/CDO.js
var CDO_namespaceObject = {};
__webpack_require__.r(CDO_namespaceObject);
__webpack_require__.d(CDO_namespaceObject, { 
  generate: () => (CDO_generate),
  name: () => (CDO_name),
  parse: () => (CDO_parse),
  structure: () => (CDO_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/ClassSelector.js
var ClassSelector_namespaceObject = {};
__webpack_require__.r(ClassSelector_namespaceObject);
__webpack_require__.d(ClassSelector_namespaceObject, { 
  generate: () => (ClassSelector_generate),
  name: () => (ClassSelector_name),
  parse: () => (ClassSelector_parse),
  structure: () => (ClassSelector_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Combinator.js
var Combinator_namespaceObject = {};
__webpack_require__.r(Combinator_namespaceObject);
__webpack_require__.d(Combinator_namespaceObject, { 
  generate: () => (Combinator_generate),
  name: () => (Combinator_name),
  parse: () => (Combinator_parse),
  structure: () => (Combinator_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Comment.js
var Comment_namespaceObject = {};
__webpack_require__.r(Comment_namespaceObject);
__webpack_require__.d(Comment_namespaceObject, { 
  generate: () => (Comment_generate),
  name: () => (Comment_name),
  parse: () => (Comment_parse),
  structure: () => (Comment_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Condition.js
var Condition_namespaceObject = {};
__webpack_require__.r(Condition_namespaceObject);
__webpack_require__.d(Condition_namespaceObject, { 
  generate: () => (Condition_generate),
  name: () => (Condition_name),
  parse: () => (Condition_parse),
  structure: () => (Condition_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Declaration.js
var Declaration_namespaceObject = {};
__webpack_require__.r(Declaration_namespaceObject);
__webpack_require__.d(Declaration_namespaceObject, { 
  generate: () => (Declaration_generate),
  name: () => (Declaration_name),
  parse: () => (Declaration_parse),
  structure: () => (Declaration_structure),
  walkContext: () => (Declaration_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/DeclarationList.js
var DeclarationList_namespaceObject = {};
__webpack_require__.r(DeclarationList_namespaceObject);
__webpack_require__.d(DeclarationList_namespaceObject, { 
  generate: () => (DeclarationList_generate),
  name: () => (DeclarationList_name),
  parse: () => (DeclarationList_parse),
  structure: () => (DeclarationList_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Dimension.js
var Dimension_namespaceObject = {};
__webpack_require__.r(Dimension_namespaceObject);
__webpack_require__.d(Dimension_namespaceObject, { 
  generate: () => (Dimension_generate),
  name: () => (Dimension_name),
  parse: () => (Dimension_parse),
  structure: () => (Dimension_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Feature.js
var Feature_namespaceObject = {};
__webpack_require__.r(Feature_namespaceObject);
__webpack_require__.d(Feature_namespaceObject, { 
  generate: () => (Feature_generate),
  name: () => (Feature_name),
  parse: () => (Feature_parse),
  structure: () => (Feature_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/FeatureFunction.js
var FeatureFunction_namespaceObject = {};
__webpack_require__.r(FeatureFunction_namespaceObject);
__webpack_require__.d(FeatureFunction_namespaceObject, { 
  generate: () => (FeatureFunction_generate),
  name: () => (FeatureFunction_name),
  parse: () => (FeatureFunction_parse),
  structure: () => (FeatureFunction_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/FeatureRange.js
var FeatureRange_namespaceObject = {};
__webpack_require__.r(FeatureRange_namespaceObject);
__webpack_require__.d(FeatureRange_namespaceObject, { 
  generate: () => (FeatureRange_generate),
  name: () => (FeatureRange_name),
  parse: () => (FeatureRange_parse),
  structure: () => (FeatureRange_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Function.js
var Function_namespaceObject = {};
__webpack_require__.r(Function_namespaceObject);
__webpack_require__.d(Function_namespaceObject, { 
  generate: () => (Function_generate),
  name: () => (Function_name),
  parse: () => (Function_parse),
  structure: () => (Function_structure),
  walkContext: () => (Function_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/GeneralEnclosed.js
var GeneralEnclosed_namespaceObject = {};
__webpack_require__.r(GeneralEnclosed_namespaceObject);
__webpack_require__.d(GeneralEnclosed_namespaceObject, { 
  generate: () => (GeneralEnclosed_generate),
  name: () => (GeneralEnclosed_name),
  parse: () => (GeneralEnclosed_parse),
  structure: () => (GeneralEnclosed_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Hash.js
var Hash_namespaceObject = {};
__webpack_require__.r(Hash_namespaceObject);
__webpack_require__.d(Hash_namespaceObject, { 
  generate: () => (Hash_generate),
  name: () => (Hash_name),
  parse: () => (Hash_parse),
  structure: () => (Hash_structure),
  xxx: () => (xxx) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Identifier.js
var Identifier_namespaceObject = {};
__webpack_require__.r(Identifier_namespaceObject);
__webpack_require__.d(Identifier_namespaceObject, { 
  generate: () => (Identifier_generate),
  name: () => (Identifier_name),
  parse: () => (Identifier_parse),
  structure: () => (Identifier_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/IdSelector.js
var IdSelector_namespaceObject = {};
__webpack_require__.r(IdSelector_namespaceObject);
__webpack_require__.d(IdSelector_namespaceObject, { 
  generate: () => (IdSelector_generate),
  name: () => (IdSelector_name),
  parse: () => (IdSelector_parse),
  structure: () => (IdSelector_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Layer.js
var Layer_namespaceObject = {};
__webpack_require__.r(Layer_namespaceObject);
__webpack_require__.d(Layer_namespaceObject, { 
  generate: () => (Layer_generate),
  name: () => (Layer_name),
  parse: () => (Layer_parse),
  structure: () => (Layer_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/LayerList.js
var LayerList_namespaceObject = {};
__webpack_require__.r(LayerList_namespaceObject);
__webpack_require__.d(LayerList_namespaceObject, { 
  generate: () => (LayerList_generate),
  name: () => (LayerList_name),
  parse: () => (LayerList_parse),
  structure: () => (LayerList_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/MediaQuery.js
var MediaQuery_namespaceObject = {};
__webpack_require__.r(MediaQuery_namespaceObject);
__webpack_require__.d(MediaQuery_namespaceObject, { 
  generate: () => (MediaQuery_generate),
  name: () => (MediaQuery_name),
  parse: () => (MediaQuery_parse),
  structure: () => (MediaQuery_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/MediaQueryList.js
var MediaQueryList_namespaceObject = {};
__webpack_require__.r(MediaQueryList_namespaceObject);
__webpack_require__.d(MediaQueryList_namespaceObject, { 
  generate: () => (MediaQueryList_generate),
  name: () => (MediaQueryList_name),
  parse: () => (MediaQueryList_parse),
  structure: () => (MediaQueryList_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/NestingSelector.js
var NestingSelector_namespaceObject = {};
__webpack_require__.r(NestingSelector_namespaceObject);
__webpack_require__.d(NestingSelector_namespaceObject, { 
  generate: () => (NestingSelector_generate),
  name: () => (NestingSelector_name),
  parse: () => (NestingSelector_parse),
  structure: () => (NestingSelector_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Nth.js
var Nth_namespaceObject = {};
__webpack_require__.r(Nth_namespaceObject);
__webpack_require__.d(Nth_namespaceObject, { 
  generate: () => (Nth_generate),
  name: () => (Nth_name),
  parse: () => (Nth_parse),
  structure: () => (Nth_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Number.js
var Number_namespaceObject = {};
__webpack_require__.r(Number_namespaceObject);
__webpack_require__.d(Number_namespaceObject, { 
  generate: () => (Number_generate),
  name: () => (Number_name),
  parse: () => (Number_parse),
  structure: () => (Number_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Operator.js
var Operator_namespaceObject = {};
__webpack_require__.r(Operator_namespaceObject);
__webpack_require__.d(Operator_namespaceObject, { 
  generate: () => (Operator_generate),
  name: () => (Operator_name),
  parse: () => (Operator_parse),
  structure: () => (Operator_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Parentheses.js
var Parentheses_namespaceObject = {};
__webpack_require__.r(Parentheses_namespaceObject);
__webpack_require__.d(Parentheses_namespaceObject, { 
  generate: () => (Parentheses_generate),
  name: () => (Parentheses_name),
  parse: () => (Parentheses_parse),
  structure: () => (Parentheses_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Percentage.js
var Percentage_namespaceObject = {};
__webpack_require__.r(Percentage_namespaceObject);
__webpack_require__.d(Percentage_namespaceObject, { 
  generate: () => (Percentage_generate),
  name: () => (Percentage_name),
  parse: () => (Percentage_parse),
  structure: () => (Percentage_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/PseudoClassSelector.js
var PseudoClassSelector_namespaceObject = {};
__webpack_require__.r(PseudoClassSelector_namespaceObject);
__webpack_require__.d(PseudoClassSelector_namespaceObject, { 
  generate: () => (PseudoClassSelector_generate),
  name: () => (PseudoClassSelector_name),
  parse: () => (PseudoClassSelector_parse),
  structure: () => (PseudoClassSelector_structure),
  walkContext: () => (PseudoClassSelector_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/PseudoElementSelector.js
var PseudoElementSelector_namespaceObject = {};
__webpack_require__.r(PseudoElementSelector_namespaceObject);
__webpack_require__.d(PseudoElementSelector_namespaceObject, { 
  generate: () => (PseudoElementSelector_generate),
  name: () => (PseudoElementSelector_name),
  parse: () => (PseudoElementSelector_parse),
  structure: () => (PseudoElementSelector_structure),
  walkContext: () => (PseudoElementSelector_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Ratio.js
var Ratio_namespaceObject = {};
__webpack_require__.r(Ratio_namespaceObject);
__webpack_require__.d(Ratio_namespaceObject, { 
  generate: () => (Ratio_generate),
  name: () => (Ratio_name),
  parse: () => (Ratio_parse),
  structure: () => (Ratio_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Raw.js
var Raw_namespaceObject = {};
__webpack_require__.r(Raw_namespaceObject);
__webpack_require__.d(Raw_namespaceObject, { 
  generate: () => (Raw_generate),
  name: () => (Raw_name),
  parse: () => (Raw_parse),
  structure: () => (Raw_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Rule.js
var Rule_namespaceObject = {};
__webpack_require__.r(Rule_namespaceObject);
__webpack_require__.d(Rule_namespaceObject, { 
  generate: () => (Rule_generate),
  name: () => (Rule_name),
  parse: () => (Rule_parse),
  structure: () => (Rule_structure),
  walkContext: () => (Rule_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Scope.js
var Scope_namespaceObject = {};
__webpack_require__.r(Scope_namespaceObject);
__webpack_require__.d(Scope_namespaceObject, { 
  generate: () => (Scope_generate),
  name: () => (Scope_name),
  parse: () => (Scope_parse),
  structure: () => (Scope_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Selector.js
var Selector_namespaceObject = {};
__webpack_require__.r(Selector_namespaceObject);
__webpack_require__.d(Selector_namespaceObject, { 
  generate: () => (Selector_generate),
  name: () => (Selector_name),
  parse: () => (Selector_parse),
  structure: () => (Selector_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/SelectorList.js
var SelectorList_namespaceObject = {};
__webpack_require__.r(SelectorList_namespaceObject);
__webpack_require__.d(SelectorList_namespaceObject, { 
  generate: () => (SelectorList_generate),
  name: () => (SelectorList_name),
  parse: () => (SelectorList_parse),
  structure: () => (SelectorList_structure),
  walkContext: () => (SelectorList_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/String.js
var String_namespaceObject = {};
__webpack_require__.r(String_namespaceObject);
__webpack_require__.d(String_namespaceObject, { 
  generate: () => (String_generate),
  name: () => (String_name),
  parse: () => (String_parse),
  structure: () => (String_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/StyleSheet.js
var StyleSheet_namespaceObject = {};
__webpack_require__.r(StyleSheet_namespaceObject);
__webpack_require__.d(StyleSheet_namespaceObject, { 
  generate: () => (StyleSheet_generate),
  name: () => (StyleSheet_name),
  parse: () => (StyleSheet_parse),
  structure: () => (StyleSheet_structure),
  walkContext: () => (StyleSheet_walkContext) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/SupportsDeclaration.js
var SupportsDeclaration_namespaceObject = {};
__webpack_require__.r(SupportsDeclaration_namespaceObject);
__webpack_require__.d(SupportsDeclaration_namespaceObject, { 
  generate: () => (SupportsDeclaration_generate),
  name: () => (SupportsDeclaration_name),
  parse: () => (SupportsDeclaration_parse),
  structure: () => (SupportsDeclaration_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/TypeSelector.js
var TypeSelector_namespaceObject = {};
__webpack_require__.r(TypeSelector_namespaceObject);
__webpack_require__.d(TypeSelector_namespaceObject, { 
  generate: () => (TypeSelector_generate),
  name: () => (TypeSelector_name),
  parse: () => (TypeSelector_parse),
  structure: () => (TypeSelector_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/UnicodeRange.js
var UnicodeRange_namespaceObject = {};
__webpack_require__.r(UnicodeRange_namespaceObject);
__webpack_require__.d(UnicodeRange_namespaceObject, { 
  generate: () => (UnicodeRange_generate),
  name: () => (UnicodeRange_name),
  parse: () => (UnicodeRange_parse),
  structure: () => (UnicodeRange_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Url.js
var Url_namespaceObject = {};
__webpack_require__.r(Url_namespaceObject);
__webpack_require__.d(Url_namespaceObject, { 
  generate: () => (Url_generate),
  name: () => (Url_name),
  parse: () => (Url_parse),
  structure: () => (Url_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/Value.js
var Value_namespaceObject = {};
__webpack_require__.r(Value_namespaceObject);
__webpack_require__.d(Value_namespaceObject, { 
  generate: () => (Value_generate),
  name: () => (Value_name),
  parse: () => (Value_parse),
  structure: () => (Value_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/WhiteSpace.js
var WhiteSpace_namespaceObject = {};
__webpack_require__.r(WhiteSpace_namespaceObject);
__webpack_require__.d(WhiteSpace_namespaceObject, { 
  generate: () => (WhiteSpace_generate),
  name: () => (WhiteSpace_name),
  parse: () => (WhiteSpace_parse),
  structure: () => (WhiteSpace_structure) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/index.js
var node_namespaceObject = {};
__webpack_require__.r(node_namespaceObject);
__webpack_require__.d(node_namespaceObject, { 
  AnPlusB: () => (AnPlusB_namespaceObject),
  Atrule: () => (Atrule_namespaceObject),
  AtrulePrelude: () => (AtrulePrelude_namespaceObject),
  AttributeSelector: () => (AttributeSelector_namespaceObject),
  Block: () => (Block_namespaceObject),
  Brackets: () => (Brackets_namespaceObject),
  CDC: () => (CDC_namespaceObject),
  CDO: () => (CDO_namespaceObject),
  ClassSelector: () => (ClassSelector_namespaceObject),
  Combinator: () => (Combinator_namespaceObject),
  Comment: () => (Comment_namespaceObject),
  Condition: () => (Condition_namespaceObject),
  Declaration: () => (Declaration_namespaceObject),
  DeclarationList: () => (DeclarationList_namespaceObject),
  Dimension: () => (Dimension_namespaceObject),
  Feature: () => (Feature_namespaceObject),
  FeatureFunction: () => (FeatureFunction_namespaceObject),
  FeatureRange: () => (FeatureRange_namespaceObject),
  Function: () => (Function_namespaceObject),
  GeneralEnclosed: () => (GeneralEnclosed_namespaceObject),
  Hash: () => (Hash_namespaceObject),
  IdSelector: () => (IdSelector_namespaceObject),
  Identifier: () => (Identifier_namespaceObject),
  Layer: () => (Layer_namespaceObject),
  LayerList: () => (LayerList_namespaceObject),
  MediaQuery: () => (MediaQuery_namespaceObject),
  MediaQueryList: () => (MediaQueryList_namespaceObject),
  NestingSelector: () => (NestingSelector_namespaceObject),
  Nth: () => (Nth_namespaceObject),
  Number: () => (Number_namespaceObject),
  Operator: () => (Operator_namespaceObject),
  Parentheses: () => (Parentheses_namespaceObject),
  Percentage: () => (Percentage_namespaceObject),
  PseudoClassSelector: () => (PseudoClassSelector_namespaceObject),
  PseudoElementSelector: () => (PseudoElementSelector_namespaceObject),
  Ratio: () => (Ratio_namespaceObject),
  Raw: () => (Raw_namespaceObject),
  Rule: () => (Rule_namespaceObject),
  Scope: () => (Scope_namespaceObject),
  Selector: () => (Selector_namespaceObject),
  SelectorList: () => (SelectorList_namespaceObject),
  String: () => (String_namespaceObject),
  StyleSheet: () => (StyleSheet_namespaceObject),
  SupportsDeclaration: () => (SupportsDeclaration_namespaceObject),
  TypeSelector: () => (TypeSelector_namespaceObject),
  UnicodeRange: () => (UnicodeRange_namespaceObject),
  Url: () => (Url_namespaceObject),
  Value: () => (Value_namespaceObject),
  WhiteSpace: () => (WhiteSpace_namespaceObject) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/scope/index.js
var scope_namespaceObject = {};
__webpack_require__.r(scope_namespaceObject);
__webpack_require__.d(scope_namespaceObject, { 
  AtrulePrelude: () => (atrulePrelude),
  Selector: () => (scope_selector),
  Value: () => (scope_value) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/syntax/node/index-parse.js
var index_parse_namespaceObject = {};
__webpack_require__.r(index_parse_namespaceObject);
__webpack_require__.d(index_parse_namespaceObject, { 
  AnPlusB: () => (AnPlusB_parse),
  Atrule: () => (Atrule_parse),
  AtrulePrelude: () => (AtrulePrelude_parse),
  AttributeSelector: () => (AttributeSelector_parse),
  Block: () => (Block_parse),
  Brackets: () => (Brackets_parse),
  CDC: () => (CDC_parse),
  CDO: () => (CDO_parse),
  ClassSelector: () => (ClassSelector_parse),
  Combinator: () => (Combinator_parse),
  Comment: () => (Comment_parse),
  Condition: () => (Condition_parse),
  Declaration: () => (Declaration_parse),
  DeclarationList: () => (DeclarationList_parse),
  Dimension: () => (Dimension_parse),
  Feature: () => (Feature_parse),
  FeatureFunction: () => (FeatureFunction_parse),
  FeatureRange: () => (FeatureRange_parse),
  Function: () => (Function_parse),
  GeneralEnclosed: () => (GeneralEnclosed_parse),
  Hash: () => (Hash_parse),
  IdSelector: () => (IdSelector_parse),
  Identifier: () => (Identifier_parse),
  Layer: () => (Layer_parse),
  LayerList: () => (LayerList_parse),
  MediaQuery: () => (MediaQuery_parse),
  MediaQueryList: () => (MediaQueryList_parse),
  NestingSelector: () => (NestingSelector_parse),
  Nth: () => (Nth_parse),
  Number: () => (Number_parse),
  Operator: () => (Operator_parse),
  Parentheses: () => (Parentheses_parse),
  Percentage: () => (Percentage_parse),
  PseudoClassSelector: () => (PseudoClassSelector_parse),
  PseudoElementSelector: () => (PseudoElementSelector_parse),
  Ratio: () => (Ratio_parse),
  Raw: () => (Raw_parse),
  Rule: () => (Rule_parse),
  Scope: () => (Scope_parse),
  Selector: () => (Selector_parse),
  SelectorList: () => (SelectorList_parse),
  String: () => (String_parse),
  StyleSheet: () => (StyleSheet_parse),
  SupportsDeclaration: () => (SupportsDeclaration_parse),
  TypeSelector: () => (TypeSelector_parse),
  UnicodeRange: () => (UnicodeRange_parse),
  Url: () => (Url_parse),
  Value: () => (Value_parse),
  WhiteSpace: () => (WhiteSpace_parse) });

// NAMESPACE OBJECT: ../../node_modules/css-tree/lib/index.js
var lib_namespaceObject = {};
__webpack_require__.r(lib_namespaceObject);
__webpack_require__.d(lib_namespaceObject, { 
  cM: () => (lib_generate),
  qg: () => (lib_parse),
  GG: () => (lib_walk) });


;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/tokenizer/char-code-definitions.js
const EOF = 0;

// https://drafts.csswg.org/css-syntax-3/
// § 4.2. Definitions

// digit
// A code point between U+0030 DIGIT ZERO (0) and U+0039 DIGIT NINE (9).
function isDigit(code) {
    return code >= 0x0030 && code <= 0x0039;
}

// hex digit
// A digit, or a code point between U+0041 LATIN CAPITAL LETTER A (A) and U+0046 LATIN CAPITAL LETTER F (F),
// or a code point between U+0061 LATIN SMALL LETTER A (a) and U+0066 LATIN SMALL LETTER F (f).
function isHexDigit(code) {
    return (
        isDigit(code) || // 0 .. 9
        (code >= 0x0041 && code <= 0x0046) || // A .. F
        (code >= 0x0061 && code <= 0x0066)    // a .. f
    );
}

// uppercase letter
// A code point between U+0041 LATIN CAPITAL LETTER A (A) and U+005A LATIN CAPITAL LETTER Z (Z).
function isUppercaseLetter(code) {
    return code >= 0x0041 && code <= 0x005A;
}

// lowercase letter
// A code point between U+0061 LATIN SMALL LETTER A (a) and U+007A LATIN SMALL LETTER Z (z).
function isLowercaseLetter(code) {
    return code >= 0x0061 && code <= 0x007A;
}

// letter
// An uppercase letter or a lowercase letter.
function isLetter(code) {
    return isUppercaseLetter(code) || isLowercaseLetter(code);
}

// non-ASCII code point
// A code point with a value equal to or greater than U+0080 <control>.
//
// 2024-09-02: The latest spec narrows the range for non-ASCII characters (see https://github.com/csstree/csstree/issues/188).
// However, all modern browsers support a wider range, and strictly following the latest spec could result
// in some CSS being parsed incorrectly, even though it works in the browser. Therefore, this function adheres
// to the previous, broader definition of non-ASCII characters.
function isNonAscii(code) {
    return code >= 0x0080;
}

// name-start code point
// A letter, a non-ASCII code point, or U+005F LOW LINE (_).
function isNameStart(code) {
    return isLetter(code) || isNonAscii(code) || code === 0x005F;
}

// name code point
// A name-start code point, a digit, or U+002D HYPHEN-MINUS (-).
function isName(code) {
    return isNameStart(code) || isDigit(code) || code === 0x002D;
}

// non-printable code point
// A code point between U+0000 NULL and U+0008 BACKSPACE, or U+000B LINE TABULATION,
// or a code point between U+000E SHIFT OUT and U+001F INFORMATION SEPARATOR ONE, or U+007F DELETE.
function isNonPrintable(code) {
    return (
        (code >= 0x0000 && code <= 0x0008) ||
        (code === 0x000B) ||
        (code >= 0x000E && code <= 0x001F) ||
        (code === 0x007F)
    );
}

// newline
// U+000A LINE FEED. Note that U+000D CARRIAGE RETURN and U+000C FORM FEED are not included in this definition,
// as they are converted to U+000A LINE FEED during preprocessing.
// TODO: we doesn't do a preprocessing, so check a code point for U+000D CARRIAGE RETURN and U+000C FORM FEED
function isNewline(code) {
    return code === 0x000A || code === 0x000D || code === 0x000C;
}

// whitespace
// A newline, U+0009 CHARACTER TABULATION, or U+0020 SPACE.
function isWhiteSpace(code) {
    return isNewline(code) || code === 0x0020 || code === 0x0009;
}

// § 4.3.8. Check if two code points are a valid escape
function isValidEscape(first, second) {
    // If the first code point is not U+005C REVERSE SOLIDUS (\), return false.
    if (first !== 0x005C) {
        return false;
    }

    // Otherwise, if the second code point is a newline or EOF, return false.
    if (isNewline(second) || second === EOF) {
        return false;
    }

    // Otherwise, return true.
    return true;
}

// § 4.3.9. Check if three code points would start an identifier
function isIdentifierStart(first, second, third) {
    // Look at the first code point:

    // U+002D HYPHEN-MINUS
    if (first === 0x002D) {
        // If the second code point is a name-start code point or a U+002D HYPHEN-MINUS,
        // or the second and third code points are a valid escape, return true. Otherwise, return false.
        return (
            isNameStart(second) ||
            second === 0x002D ||
            isValidEscape(second, third)
        );
    }

    // name-start code point
    if (isNameStart(first)) {
        // Return true.
        return true;
    }

    // U+005C REVERSE SOLIDUS (\)
    if (first === 0x005C) {
        // If the first and second code points are a valid escape, return true. Otherwise, return false.
        return isValidEscape(first, second);
    }

    // anything else
    // Return false.
    return false;
}

// § 4.3.10. Check if three code points would start a number
function isNumberStart(first, second, third) {
    // Look at the first code point:

    // U+002B PLUS SIGN (+)
    // U+002D HYPHEN-MINUS (-)
    if (first === 0x002B || first === 0x002D) {
        // If the second code point is a digit, return true.
        if (isDigit(second)) {
            return 2;
        }

        // Otherwise, if the second code point is a U+002E FULL STOP (.)
        // and the third code point is a digit, return true.
        // Otherwise, return false.
        return second === 0x002E && isDigit(third) ? 3 : 0;
    }

    // U+002E FULL STOP (.)
    if (first === 0x002E) {
        // If the second code point is a digit, return true. Otherwise, return false.
        return isDigit(second) ? 2 : 0;
    }

    // digit
    if (isDigit(first)) {
        // Return true.
        return 1;
    }

    // anything else
    // Return false.
    return 0;
}

//
// Misc
//

// detect BOM (https://en.wikipedia.org/wiki/Byte_order_mark)
function isBOM(code) {
    // UTF-16BE
    if (code === 0xFEFF) {
        return 1;
    }

    // UTF-16LE
    if (code === 0xFFFE) {
        return 1;
    }

    return 0;
}

// Fast code category
// Only ASCII code points has a special meaning, that's why we define a maps for 0..127 codes only
const CATEGORY = new Array(0x80);
const EofCategory = 0x80;
const WhiteSpaceCategory = 0x82;
const DigitCategory = 0x83;
const NameStartCategory = 0x84;
const NonPrintableCategory = 0x85;

for (let i = 0; i < CATEGORY.length; i++) {
    CATEGORY[i] =
        isWhiteSpace(i) && WhiteSpaceCategory ||
        isDigit(i) && DigitCategory ||
        isNameStart(i) && NameStartCategory ||
        isNonPrintable(i) && NonPrintableCategory ||
        i || EofCategory;
}

function charCodeCategory(code) {
    return code < 0x80 ? CATEGORY[code] : NameStartCategory;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/tokenizer/utils.js


function utils_getCharCode(source, offset) {
    return offset < source.length ? source.charCodeAt(offset) : 0;
}

function getNewlineLength(source, offset, code) {
    if (code === 13 /* \r */ && utils_getCharCode(source, offset + 1) === 10 /* \n */) {
        return 2;
    }

    return 1;
}

function cmpChar(testStr, offset, referenceCode) {
    let code = testStr.charCodeAt(offset);

    // code.toLowerCase() for A..Z
    if (isUppercaseLetter(code)) {
        code = code | 32;
    }

    return code === referenceCode;
}

function cmpStr(testStr, start, end, referenceStr) {
    if (end - start !== referenceStr.length) {
        return false;
    }

    if (start < 0 || end > testStr.length) {
        return false;
    }

    for (let i = start; i < end; i++) {
        const referenceCode = referenceStr.charCodeAt(i - start);
        let testCode = testStr.charCodeAt(i);

        // testCode.toLowerCase() for A..Z
        if (isUppercaseLetter(testCode)) {
            testCode = testCode | 32;
        }

        if (testCode !== referenceCode) {
            return false;
        }
    }

    return true;
}

function findWhiteSpaceStart(source, offset) {
    for (; offset >= 0; offset--) {
        if (!isWhiteSpace(source.charCodeAt(offset))) {
            break;
        }
    }

    return offset + 1;
}

function findWhiteSpaceEnd(source, offset) {
    for (; offset < source.length; offset++) {
        if (!isWhiteSpace(source.charCodeAt(offset))) {
            break;
        }
    }

    return offset;
}

function findDecimalNumberEnd(source, offset) {
    for (; offset < source.length; offset++) {
        if (!isDigit(source.charCodeAt(offset))) {
            break;
        }
    }

    return offset;
}

// § 4.3.7. Consume an escaped code point
function consumeEscaped(source, offset) {
    // It assumes that the U+005C REVERSE SOLIDUS (\) has already been consumed and
    // that the next input code point has already been verified to be part of a valid escape.
    offset += 2;

    // hex digit
    if (isHexDigit(utils_getCharCode(source, offset - 1))) {
        // Consume as many hex digits as possible, but no more than 5.
        // Note that this means 1-6 hex digits have been consumed in total.
        for (const maxOffset = Math.min(source.length, offset + 5); offset < maxOffset; offset++) {
            if (!isHexDigit(utils_getCharCode(source, offset))) {
                break;
            }
        }

        // If the next input code point is whitespace, consume it as well.
        const code = utils_getCharCode(source, offset);
        if (isWhiteSpace(code)) {
            offset += getNewlineLength(source, offset, code);
        }
    }

    return offset;
}

// §4.3.11. Consume a name
// Note: This algorithm does not do the verification of the first few code points that are necessary
// to ensure the returned code points would constitute an <ident-token>. If that is the intended use,
// ensure that the stream starts with an identifier before calling this algorithm.
function consumeName(source, offset) {
    // Let result initially be an empty string.
    // Repeatedly consume the next input code point from the stream:
    for (; offset < source.length; offset++) {
        const code = source.charCodeAt(offset);

        // name code point
        if (isName(code)) {
            // Append the code point to result.
            continue;
        }

        // the stream starts with a valid escape
        if (isValidEscape(code, utils_getCharCode(source, offset + 1))) {
            // Consume an escaped code point. Append the returned code point to result.
            offset = consumeEscaped(source, offset) - 1;
            continue;
        }

        // anything else
        // Reconsume the current input code point. Return result.
        break;
    }

    return offset;
}

// §4.3.12. Consume a number
function consumeNumber(source, offset) {
    let code = source.charCodeAt(offset);

    // 2. If the next input code point is U+002B PLUS SIGN (+) or U+002D HYPHEN-MINUS (-),
    // consume it and append it to repr.
    if (code === 0x002B || code === 0x002D) {
        code = source.charCodeAt(offset += 1);
    }

    // 3. While the next input code point is a digit, consume it and append it to repr.
    if (isDigit(code)) {
        offset = findDecimalNumberEnd(source, offset + 1);
        code = source.charCodeAt(offset);
    }

    // 4. If the next 2 input code points are U+002E FULL STOP (.) followed by a digit, then:
    if (code === 0x002E && isDigit(source.charCodeAt(offset + 1))) {
        // 4.1 Consume them.
        // 4.2 Append them to repr.
        offset += 2;

        // 4.3 Set type to "number".
        // TODO

        // 4.4 While the next input code point is a digit, consume it and append it to repr.

        offset = findDecimalNumberEnd(source, offset);
    }

    // 5. If the next 2 or 3 input code points are U+0045 LATIN CAPITAL LETTER E (E)
    // or U+0065 LATIN SMALL LETTER E (e), ... , followed by a digit, then:
    if (cmpChar(source, offset, 101 /* e */)) {
        let sign = 0;
        code = source.charCodeAt(offset + 1);

        // ... optionally followed by U+002D HYPHEN-MINUS (-) or U+002B PLUS SIGN (+) ...
        if (code === 0x002D || code === 0x002B) {
            sign = 1;
            code = source.charCodeAt(offset + 2);
        }

        // ... followed by a digit
        if (isDigit(code)) {
            // 5.1 Consume them.
            // 5.2 Append them to repr.

            // 5.3 Set type to "number".
            // TODO

            // 5.4 While the next input code point is a digit, consume it and append it to repr.
            offset = findDecimalNumberEnd(source, offset + 1 + sign + 1);
        }
    }

    return offset;
}

// § 4.3.14. Consume the remnants of a bad url
// ... its sole use is to consume enough of the input stream to reach a recovery point
// where normal tokenizing can resume.
function consumeBadUrlRemnants(source, offset) {
    // Repeatedly consume the next input code point from the stream:
    for (; offset < source.length; offset++) {
        const code = source.charCodeAt(offset);

        // U+0029 RIGHT PARENTHESIS ())
        // EOF
        if (code === 0x0029) {
            // Return.
            offset++;
            break;
        }

        if (isValidEscape(code, utils_getCharCode(source, offset + 1))) {
            // Consume an escaped code point.
            // Note: This allows an escaped right parenthesis ("\)") to be encountered
            // without ending the <bad-url-token>. This is otherwise identical to
            // the "anything else" clause.
            offset = consumeEscaped(source, offset);
        }
    }

    return offset;
}

// § 4.3.7. Consume an escaped code point
// Note: This algorithm assumes that escaped is valid without leading U+005C REVERSE SOLIDUS (\)
function decodeEscaped(escaped) {
    // Single char escaped that's not a hex digit
    if (escaped.length === 1 && !isHexDigit(escaped.charCodeAt(0))) {
        return escaped[0];
    }

    // Interpret the hex digits as a hexadecimal number.
    let code = parseInt(escaped, 16);

    if (
        (code === 0) ||                       // If this number is zero,
        (code >= 0xD800 && code <= 0xDFFF) || // or is for a surrogate,
        (code > 0x10FFFF)                     // or is greater than the maximum allowed code point
    ) {
        // ... return U+FFFD REPLACEMENT CHARACTER
        code = 0xFFFD;
    }

    // Otherwise, return the code point with that value.
    return String.fromCodePoint(code);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/tokenizer/index.js




function tokenizer_tokenize(source, onToken) {
    function getCharCode(offset) {
        return offset < sourceLength ? source.charCodeAt(offset) : 0;
    }

    // § 4.3.3. Consume a numeric token
    function consumeNumericToken() {
        // Consume a number and let number be the result.
        offset = consumeNumber(source, offset);

        // If the next 3 input code points would start an identifier, then:
        if (isIdentifierStart(getCharCode(offset), getCharCode(offset + 1), getCharCode(offset + 2))) {
            // Create a <dimension-token> with the same value and type flag as number, and a unit set initially to the empty string.
            // Consume a name. Set the <dimension-token>’s unit to the returned value.
            // Return the <dimension-token>.
            type = (/* inlined export .Dimension */12);
            offset = consumeName(source, offset);
            return;
        }

        // Otherwise, if the next input code point is U+0025 PERCENTAGE SIGN (%), consume it.
        if (getCharCode(offset) === 0x0025) {
            // Create a <percentage-token> with the same value as number, and return it.
            type = (/* inlined export .Percentage */11);
            offset++;
            return;
        }

        // Otherwise, create a <number-token> with the same value and type flag as number, and return it.
        type = (/* inlined export .Number */10);
    }

    // § 4.3.4. Consume an ident-like token
    function consumeIdentLikeToken() {
        const nameStartOffset = offset;

        // Consume a name, and let string be the result.
        offset = consumeName(source, offset);

        // If string’s value is an ASCII case-insensitive match for "url",
        // and the next input code point is U+0028 LEFT PARENTHESIS ((), consume it.
        if (cmpStr(source, nameStartOffset, offset, 'url') && getCharCode(offset) === 0x0028) {
            // While the next two input code points are whitespace, consume the next input code point.
            offset = findWhiteSpaceEnd(source, offset + 1);

            // If the next one or two input code points are U+0022 QUOTATION MARK ("), U+0027 APOSTROPHE ('),
            // or whitespace followed by U+0022 QUOTATION MARK (") or U+0027 APOSTROPHE ('),
            // then create a <function-token> with its value set to string and return it.
            if (getCharCode(offset) === 0x0022 ||
                getCharCode(offset) === 0x0027) {
                type = (/* inlined export .Function */2);
                offset = nameStartOffset + 4;
                return;
            }

            // Otherwise, consume a url token, and return it.
            consumeUrlToken();
            return;
        }

        // Otherwise, if the next input code point is U+0028 LEFT PARENTHESIS ((), consume it.
        // Create a <function-token> with its value set to string and return it.
        if (getCharCode(offset) === 0x0028) {
            type = (/* inlined export .Function */2);
            offset++;
            return;
        }

        // Otherwise, create an <ident-token> with its value set to string and return it.
        type = (/* inlined export .Ident */1);
    }

    // § 4.3.5. Consume a string token
    function consumeStringToken(endingCodePoint) {
        // This algorithm may be called with an ending code point, which denotes the code point
        // that ends the string. If an ending code point is not specified,
        // the current input code point is used.
        if (!endingCodePoint) {
            endingCodePoint = getCharCode(offset++);
        }

        // Initially create a <string-token> with its value set to the empty string.
        type = (/* inlined export .String */5);

        // Repeatedly consume the next input code point from the stream:
        for (; offset < source.length; offset++) {
            const code = source.charCodeAt(offset);

            switch (charCodeCategory(code)) {
                // ending code point
                case endingCodePoint:
                    // Return the <string-token>.
                    offset++;
                    return;

                    // EOF
                    // case EofCategory:
                    // This is a parse error. Return the <string-token>.
                    // return;

                // newline
                case (/* inlined export .WhiteSpaceCategory */130):
                    if (isNewline(code)) {
                        // This is a parse error. Reconsume the current input code point,
                        // create a <bad-string-token>, and return it.
                        offset += getNewlineLength(source, offset, code);
                        type = (/* inlined export .BadString */6);
                        return;
                    }
                    break;

                // U+005C REVERSE SOLIDUS (\)
                case 0x005C:
                    // If the next input code point is EOF, do nothing.
                    if (offset === source.length - 1) {
                        break;
                    }

                    const nextCode = getCharCode(offset + 1);

                    // Otherwise, if the next input code point is a newline, consume it.
                    if (isNewline(nextCode)) {
                        offset += getNewlineLength(source, offset + 1, nextCode);
                    } else if (isValidEscape(code, nextCode)) {
                        // Otherwise, (the stream starts with a valid escape) consume
                        // an escaped code point and append the returned code point to
                        // the <string-token>’s value.
                        offset = consumeEscaped(source, offset) - 1;
                    }
                    break;

                // anything else
                // Append the current input code point to the <string-token>’s value.
            }
        }
    }

    // § 4.3.6. Consume a url token
    // Note: This algorithm assumes that the initial "url(" has already been consumed.
    // This algorithm also assumes that it’s being called to consume an "unquoted" value, like url(foo).
    // A quoted value, like url("foo"), is parsed as a <function-token>. Consume an ident-like token
    // automatically handles this distinction; this algorithm shouldn’t be called directly otherwise.
    function consumeUrlToken() {
        // Initially create a <url-token> with its value set to the empty string.
        type = (/* inlined export .Url */7);

        // Consume as much whitespace as possible.
        offset = findWhiteSpaceEnd(source, offset);

        // Repeatedly consume the next input code point from the stream:
        for (; offset < source.length; offset++) {
            const code = source.charCodeAt(offset);

            switch (charCodeCategory(code)) {
                // U+0029 RIGHT PARENTHESIS ())
                case 0x0029:
                    // Return the <url-token>.
                    offset++;
                    return;

                    // EOF
                    // case EofCategory:
                    // This is a parse error. Return the <url-token>.
                    // return;

                // whitespace
                case (/* inlined export .WhiteSpaceCategory */130):
                    // Consume as much whitespace as possible.
                    offset = findWhiteSpaceEnd(source, offset);

                    // If the next input code point is U+0029 RIGHT PARENTHESIS ()) or EOF,
                    // consume it and return the <url-token>
                    // (if EOF was encountered, this is a parse error);
                    if (getCharCode(offset) === 0x0029 || offset >= source.length) {
                        if (offset < source.length) {
                            offset++;
                        }
                        return;
                    }

                    // otherwise, consume the remnants of a bad url, create a <bad-url-token>,
                    // and return it.
                    offset = consumeBadUrlRemnants(source, offset);
                    type = (/* inlined export .BadUrl */8);
                    return;

                // U+0022 QUOTATION MARK (")
                // U+0027 APOSTROPHE (')
                // U+0028 LEFT PARENTHESIS (()
                // non-printable code point
                case 0x0022:
                case 0x0027:
                case 0x0028:
                case (/* inlined export .NonPrintableCategory */133):
                    // This is a parse error. Consume the remnants of a bad url,
                    // create a <bad-url-token>, and return it.
                    offset = consumeBadUrlRemnants(source, offset);
                    type = (/* inlined export .BadUrl */8);
                    return;

                // U+005C REVERSE SOLIDUS (\)
                case 0x005C:
                    // If the stream starts with a valid escape, consume an escaped code point and
                    // append the returned code point to the <url-token>’s value.
                    if (isValidEscape(code, getCharCode(offset + 1))) {
                        offset = consumeEscaped(source, offset) - 1;
                        break;
                    }

                    // Otherwise, this is a parse error. Consume the remnants of a bad url,
                    // create a <bad-url-token>, and return it.
                    offset = consumeBadUrlRemnants(source, offset);
                    type = (/* inlined export .BadUrl */8);
                    return;

                // anything else
                // Append the current input code point to the <url-token>’s value.
            }
        }
    }

    // ensure source is a string
    source = String(source || '');

    const sourceLength = source.length;
    let start = isBOM(getCharCode(0));
    let offset = start;
    let type;

    // https://drafts.csswg.org/css-syntax-3/#consume-token
    // § 4.3.1. Consume a token
    while (offset < sourceLength) {
        const code = source.charCodeAt(offset);

        switch (charCodeCategory(code)) {
            // whitespace
            case (/* inlined export .WhiteSpaceCategory */130):
                // Consume as much whitespace as possible. Return a <whitespace-token>.
                type = (/* inlined export .WhiteSpace */13);
                offset = findWhiteSpaceEnd(source, offset + 1);
                break;

            // U+0022 QUOTATION MARK (")
            case 0x0022:
                // Consume a string token and return it.
                consumeStringToken();
                break;

            // U+0023 NUMBER SIGN (#)
            case 0x0023:
                // If the next input code point is a name code point or the next two input code points are a valid escape, then:
                if (isName(getCharCode(offset + 1)) || isValidEscape(getCharCode(offset + 1), getCharCode(offset + 2))) {
                    // Create a <hash-token>.
                    type = (/* inlined export .Hash */4);

                    // If the next 3 input code points would start an identifier, set the <hash-token>’s type flag to "id".
                    // if (isIdentifierStart(getCharCode(offset + 1), getCharCode(offset + 2), getCharCode(offset + 3))) {
                    //     // TODO: set id flag
                    // }

                    // Consume a name, and set the <hash-token>’s value to the returned string.
                    offset = consumeName(source, offset + 1);

                    // Return the <hash-token>.
                } else {
                    // Otherwise, return a <delim-token> with its value set to the current input code point.
                    type = (/* inlined export .Delim */9);
                    offset++;
                }

                break;

            // U+0027 APOSTROPHE (')
            case 0x0027:
                // Consume a string token and return it.
                consumeStringToken();
                break;

            // U+0028 LEFT PARENTHESIS (()
            case 0x0028:
                // Return a <(-token>.
                type = (/* inlined export .LeftParenthesis */21);
                offset++;
                break;

            // U+0029 RIGHT PARENTHESIS ())
            case 0x0029:
                // Return a <)-token>.
                type = (/* inlined export .RightParenthesis */22);
                offset++;
                break;

            // U+002B PLUS SIGN (+)
            case 0x002B:
                // If the input stream starts with a number, ...
                if (isNumberStart(code, getCharCode(offset + 1), getCharCode(offset + 2))) {
                    // ... reconsume the current input code point, consume a numeric token, and return it.
                    consumeNumericToken();
                } else {
                    // Otherwise, return a <delim-token> with its value set to the current input code point.
                    type = (/* inlined export .Delim */9);
                    offset++;
                }
                break;

            // U+002C COMMA (,)
            case 0x002C:
                // Return a <comma-token>.
                type = (/* inlined export .Comma */18);
                offset++;
                break;

            // U+002D HYPHEN-MINUS (-)
            case 0x002D:
                // If the input stream starts with a number, reconsume the current input code point, consume a numeric token, and return it.
                if (isNumberStart(code, getCharCode(offset + 1), getCharCode(offset + 2))) {
                    consumeNumericToken();
                } else {
                    // Otherwise, if the next 2 input code points are U+002D HYPHEN-MINUS U+003E GREATER-THAN SIGN (->), consume them and return a <CDC-token>.
                    if (getCharCode(offset + 1) === 0x002D &&
                        getCharCode(offset + 2) === 0x003E) {
                        type = (/* inlined export .CDC */15);
                        offset = offset + 3;
                    } else {
                        // Otherwise, if the input stream starts with an identifier, ...
                        if (isIdentifierStart(code, getCharCode(offset + 1), getCharCode(offset + 2))) {
                            // ... reconsume the current input code point, consume an ident-like token, and return it.
                            consumeIdentLikeToken();
                        } else {
                            // Otherwise, return a <delim-token> with its value set to the current input code point.
                            type = (/* inlined export .Delim */9);
                            offset++;
                        }
                    }
                }
                break;

            // U+002E FULL STOP (.)
            case 0x002E:
                // If the input stream starts with a number, ...
                if (isNumberStart(code, getCharCode(offset + 1), getCharCode(offset + 2))) {
                    // ... reconsume the current input code point, consume a numeric token, and return it.
                    consumeNumericToken();
                } else {
                    // Otherwise, return a <delim-token> with its value set to the current input code point.
                    type = (/* inlined export .Delim */9);
                    offset++;
                }

                break;

            // U+002F SOLIDUS (/)
            case 0x002F:
                // If the next two input code point are U+002F SOLIDUS (/) followed by a U+002A ASTERISK (*),
                if (getCharCode(offset + 1) === 0x002A) {
                    // ... consume them and all following code points up to and including the first U+002A ASTERISK (*)
                    // followed by a U+002F SOLIDUS (/), or up to an EOF code point.
                    type = (/* inlined export .Comment */25);
                    offset = source.indexOf('*/', offset + 2);
                    offset = offset === -1 ? source.length : offset + 2;
                } else {
                    type = (/* inlined export .Delim */9);
                    offset++;
                }
                break;

            // U+003A COLON (:)
            case 0x003A:
                // Return a <colon-token>.
                type = (/* inlined export .Colon */16);
                offset++;
                break;

            // U+003B SEMICOLON (;)
            case 0x003B:
                // Return a <semicolon-token>.
                type = (/* inlined export .Semicolon */17);
                offset++;
                break;

            // U+003C LESS-THAN SIGN (<)
            case 0x003C:
                // If the next 3 input code points are U+0021 EXCLAMATION MARK U+002D HYPHEN-MINUS U+002D HYPHEN-MINUS (!--), ...
                if (getCharCode(offset + 1) === 0x0021 &&
                    getCharCode(offset + 2) === 0x002D &&
                    getCharCode(offset + 3) === 0x002D) {
                    // ... consume them and return a <CDO-token>.
                    type = (/* inlined export .CDO */14);
                    offset = offset + 4;
                } else {
                    // Otherwise, return a <delim-token> with its value set to the current input code point.
                    type = (/* inlined export .Delim */9);
                    offset++;
                }

                break;

            // U+0040 COMMERCIAL AT (@)
            case 0x0040:
                // If the next 3 input code points would start an identifier, ...
                if (isIdentifierStart(getCharCode(offset + 1), getCharCode(offset + 2), getCharCode(offset + 3))) {
                    // ... consume a name, create an <at-keyword-token> with its value set to the returned value, and return it.
                    type = (/* inlined export .AtKeyword */3);
                    offset = consumeName(source, offset + 1);
                } else {
                    // Otherwise, return a <delim-token> with its value set to the current input code point.
                    type = (/* inlined export .Delim */9);
                    offset++;
                }

                break;

            // U+005B LEFT SQUARE BRACKET ([)
            case 0x005B:
                // Return a <[-token>.
                type = (/* inlined export .LeftSquareBracket */19);
                offset++;
                break;

            // U+005C REVERSE SOLIDUS (\)
            case 0x005C:
                // If the input stream starts with a valid escape, ...
                if (isValidEscape(code, getCharCode(offset + 1))) {
                    // ... reconsume the current input code point, consume an ident-like token, and return it.
                    consumeIdentLikeToken();
                } else {
                    // Otherwise, this is a parse error. Return a <delim-token> with its value set to the current input code point.
                    type = (/* inlined export .Delim */9);
                    offset++;
                }
                break;

            // U+005D RIGHT SQUARE BRACKET (])
            case 0x005D:
                // Return a <]-token>.
                type = (/* inlined export .RightSquareBracket */20);
                offset++;
                break;

            // U+007B LEFT CURLY BRACKET ({)
            case 0x007B:
                // Return a <{-token>.
                type = (/* inlined export .LeftCurlyBracket */23);
                offset++;
                break;

            // U+007D RIGHT CURLY BRACKET (})
            case 0x007D:
                // Return a <}-token>.
                type = (/* inlined export .RightCurlyBracket */24);
                offset++;
                break;

            // digit
            case (/* inlined export .DigitCategory */131):
                // Reconsume the current input code point, consume a numeric token, and return it.
                consumeNumericToken();
                break;

            // name-start code point
            case (/* inlined export .NameStartCategory */132):
                // Reconsume the current input code point, consume an ident-like token, and return it.
                consumeIdentLikeToken();
                break;

                // EOF
                // case EofCategory:
                // Return an <EOF-token>.
                // break;

            // anything else
            default:
                // Return a <delim-token> with its value set to the current input code point.
                type = (/* inlined export .Delim */9);
                offset++;
        }

        // put token to stream
        onToken(type, start, start = offset);
    }
}









;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/utils/List.js
//
//                              list
//                            ┌──────┐
//             ┌──────────────┼─head │
//             │              │ tail─┼──────────────┐
//             │              └──────┘              │
//             ▼                                    ▼
//            item        item        item        item
//          ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
//  null ◀──┼─prev │◀───┼─prev │◀───┼─prev │◀───┼─prev │
//          │ next─┼───▶│ next─┼───▶│ next─┼───▶│ next─┼──▶ null
//          ├──────┤    ├──────┤    ├──────┤    ├──────┤
//          │ data │    │ data │    │ data │    │ data │
//          └──────┘    └──────┘    └──────┘    └──────┘
//

let releasedCursors = null;

class List {
    static createItem(data) {
        return {
            prev: null,
            next: null,
            data
        };
    }

    constructor() {
        this.head = null;
        this.tail = null;
        this.cursor = null;
    }
    createItem(data) {
        return List.createItem(data);
    }

    // cursor helpers
    allocateCursor(prev, next) {
        let cursor;

        if (releasedCursors !== null) {
            cursor = releasedCursors;
            releasedCursors = releasedCursors.cursor;
            cursor.prev = prev;
            cursor.next = next;
            cursor.cursor = this.cursor;
        } else {
            cursor = {
                prev,
                next,
                cursor: this.cursor
            };
        }

        this.cursor = cursor;

        return cursor;
    }
    releaseCursor() {
        const { cursor } = this;

        this.cursor = cursor.cursor;
        cursor.prev = null;
        cursor.next = null;
        cursor.cursor = releasedCursors;
        releasedCursors = cursor;
    }
    updateCursors(prevOld, prevNew, nextOld, nextNew) {
        let { cursor } = this;

        while (cursor !== null) {
            if (cursor.prev === prevOld) {
                cursor.prev = prevNew;
            }

            if (cursor.next === nextOld) {
                cursor.next = nextNew;
            }

            cursor = cursor.cursor;
        }
    }
    *[Symbol.iterator]() {
        for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
            yield cursor.data;
        }
    }

    // getters
    get size() {
        let size = 0;

        for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
            size++;
        }

        return size;
    }
    get isEmpty() {
        return this.head === null;
    }
    get first() {
        return this.head && this.head.data;
    }
    get last() {
        return this.tail && this.tail.data;
    }

    // convertors
    fromArray(array) {
        let cursor = null;
        this.head = null;

        for (let data of array) {
            const item = List.createItem(data);

            if (cursor !== null) {
                cursor.next = item;
            } else {
                this.head = item;
            }

            item.prev = cursor;
            cursor = item;
        }

        this.tail = cursor;
        return this;
    }
    toArray() {
        return [...this];
    }
    toJSON() {
        return [...this];
    }

    // array-like methods
    forEach(fn, thisArg = this) {
        // push cursor
        const cursor = this.allocateCursor(null, this.head);

        while (cursor.next !== null) {
            const item = cursor.next;
            cursor.next = item.next;
            fn.call(thisArg, item.data, item, this);
        }

        // pop cursor
        this.releaseCursor();
    }
    forEachRight(fn, thisArg = this) {
        // push cursor
        const cursor = this.allocateCursor(this.tail, null);

        while (cursor.prev !== null) {
            const item = cursor.prev;
            cursor.prev = item.prev;
            fn.call(thisArg, item.data, item, this);
        }

        // pop cursor
        this.releaseCursor();
    }
    reduce(fn, initialValue, thisArg = this) {
        // push cursor
        let cursor = this.allocateCursor(null, this.head);
        let acc = initialValue;
        let item;

        while (cursor.next !== null) {
            item = cursor.next;
            cursor.next = item.next;

            acc = fn.call(thisArg, acc, item.data, item, this);
        }

        // pop cursor
        this.releaseCursor();

        return acc;
    }
    reduceRight(fn, initialValue, thisArg = this) {
        // push cursor
        let cursor = this.allocateCursor(this.tail, null);
        let acc = initialValue;
        let item;

        while (cursor.prev !== null) {
            item = cursor.prev;
            cursor.prev = item.prev;

            acc = fn.call(thisArg, acc, item.data, item, this);
        }

        // pop cursor
        this.releaseCursor();

        return acc;
    }
    some(fn, thisArg = this) {
        for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
            if (fn.call(thisArg, cursor.data, cursor, this)) {
                return true;
            }
        }

        return false;
    }
    map(fn, thisArg = this) {
        const result = new List();

        for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
            result.appendData(fn.call(thisArg, cursor.data, cursor, this));
        }

        return result;
    }
    filter(fn, thisArg = this) {
        const result = new List();

        for (let cursor = this.head; cursor !== null; cursor = cursor.next) {
            if (fn.call(thisArg, cursor.data, cursor, this)) {
                result.appendData(cursor.data);
            }
        }

        return result;
    }

    nextUntil(start, fn, thisArg = this) {
        if (start === null) {
            return;
        }

        // push cursor
        const cursor = this.allocateCursor(null, start);

        while (cursor.next !== null) {
            const item = cursor.next;
            cursor.next = item.next;
            if (fn.call(thisArg, item.data, item, this)) {
                break;
            }
        }

        // pop cursor
        this.releaseCursor();
    }
    prevUntil(start, fn, thisArg = this) {
        if (start === null) {
            return;
        }

        // push cursor
        const cursor = this.allocateCursor(start, null);

        while (cursor.prev !== null) {
            const item = cursor.prev;
            cursor.prev = item.prev;
            if (fn.call(thisArg, item.data, item, this)) {
                break;
            }
        }

        // pop cursor
        this.releaseCursor();
    }

    // mutation
    clear() {
        this.head = null;
        this.tail = null;
    }
    copy() {
        const result = new List();

        for (let data of this) {
            result.appendData(data);
        }

        return result;
    }
    prepend(item) {
        //      head
        //    ^
        // item
        this.updateCursors(null, item, this.head, item);

        // insert to the beginning of the list
        if (this.head !== null) {
            // new item <- first item
            this.head.prev = item;
            // new item -> first item
            item.next = this.head;
        } else {
            // if list has no head, then it also has no tail
            // in this case tail points to the new item
            this.tail = item;
        }

        // head always points to new item
        this.head = item;
        return this;
    }
    prependData(data) {
        return this.prepend(List.createItem(data));
    }
    append(item) {
        return this.insert(item);
    }
    appendData(data) {
        return this.insert(List.createItem(data));
    }
    insert(item, before = null) {
        if (before !== null) {
            // prev   before
            //      ^
            //     item
            this.updateCursors(before.prev, item, before, item);

            if (before.prev === null) {
                // insert to the beginning of list
                if (this.head !== before) {
                    throw new Error('before doesn\'t belong to list');
                }
                // since head points to before therefore list doesn't empty
                // no need to check tail
                this.head = item;
                before.prev = item;
                item.next = before;
                this.updateCursors(null, item);
            } else {
                // insert between two items
                before.prev.next = item;
                item.prev = before.prev;
                before.prev = item;
                item.next = before;
            }
        } else {
            // tail
            //      ^
            //      item
            this.updateCursors(this.tail, item, null, item);

            // insert to the ending of the list
            if (this.tail !== null) {
                // last item -> new item
                this.tail.next = item;
                // last item <- new item
                item.prev = this.tail;
            } else {
                // if list has no tail, then it also has no head
                // in this case head points to new item
                this.head = item;
            }

            // tail always points to new item
            this.tail = item;
        }

        return this;
    }
    insertData(data, before) {
        return this.insert(List.createItem(data), before);
    }
    remove(item) {
        //      item
        //       ^
        // prev     next
        this.updateCursors(item, item.prev, item, item.next);

        if (item.prev !== null) {
            item.prev.next = item.next;
        } else {
            if (this.head !== item) {
                throw new Error('item doesn\'t belong to list');
            }

            this.head = item.next;
        }

        if (item.next !== null) {
            item.next.prev = item.prev;
        } else {
            if (this.tail !== item) {
                throw new Error('item doesn\'t belong to list');
            }

            this.tail = item.prev;
        }

        item.prev = null;
        item.next = null;

        return item;
    }
    push(data) {
        this.insert(List.createItem(data));
    }
    pop() {
        return this.tail !== null ? this.remove(this.tail) : null;
    }
    unshift(data) {
        this.prepend(List.createItem(data));
    }
    shift() {
        return this.head !== null ? this.remove(this.head) : null;
    }
    prependList(list) {
        return this.insertList(list, this.head);
    }
    appendList(list) {
        return this.insertList(list);
    }
    insertList(list, before) {
        // ignore empty lists
        if (list.head === null) {
            return this;
        }

        if (before !== undefined && before !== null) {
            this.updateCursors(before.prev, list.tail, before, list.head);

            // insert in the middle of dist list
            if (before.prev !== null) {
                // before.prev <-> list.head
                before.prev.next = list.head;
                list.head.prev = before.prev;
            } else {
                this.head = list.head;
            }

            before.prev = list.tail;
            list.tail.next = before;
        } else {
            this.updateCursors(this.tail, list.tail, null, list.head);

            // insert to end of the list
            if (this.tail !== null) {
                // if destination list has a tail, then it also has a head,
                // but head doesn't change
                // dest tail -> source head
                this.tail.next = list.head;
                // dest tail <- source head
                list.head.prev = this.tail;
            } else {
                // if list has no a tail, then it also has no a head
                // in this case points head to new item
                this.head = list.head;
            }

            // tail always start point to new item
            this.tail = list.tail;
        }

        list.head = null;
        list.tail = null;
        return this;
    }
    replace(oldItem, newItemOrList) {
        if ('head' in newItemOrList) {
            this.insertList(newItemOrList, oldItem);
        } else {
            this.insert(newItemOrList, oldItem);
        }

        this.remove(oldItem);
    }
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/utils/create-custom-error.js
function createCustomError(name, message) {
    // use Object.create(), because some VMs prevent setting line/column otherwise
    // (iOS Safari 10 even throws an exception)
    const error = Object.create(SyntaxError.prototype);
    const errorStack = new Error();

    return Object.assign(error, {
        name,
        message,
        get stack() {
            return (errorStack.stack || '').replace(/^(.+\n){1,3}/, `${name}: ${message}\n`);
        }
    });
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/parser/SyntaxError.js


const MAX_LINE_LENGTH = 100;
const OFFSET_CORRECTION = 60;
const TAB_REPLACEMENT = '    ';

function sourceFragment({ source, line, column, baseLine, baseColumn }, extraLines) {
    function processLines(start, end) {
        return lines
            .slice(start, end)
            .map((line, idx) =>
                String(start + idx + 1).padStart(maxNumLength) + ' |' + line
            ).join('\n');
    }

    const prelines = '\n'.repeat(Math.max(baseLine - 1, 0));
    const precolumns = ' '.repeat(Math.max(baseColumn - 1, 0));
    const lines = (prelines + precolumns + source).split(/\r\n?|\n|\f/);
    const startLine = Math.max(1, line - extraLines) - 1;
    const endLine = Math.min(line + extraLines, lines.length + 1);
    const maxNumLength = Math.max(4, String(endLine).length) + 1;
    let cutLeft = 0;

    // column correction according to replaced tab before column
    column += (TAB_REPLACEMENT.length - 1) * (lines[line - 1].substr(0, column - 1).match(/\t/g) || []).length;

    if (column > MAX_LINE_LENGTH) {
        cutLeft = column - OFFSET_CORRECTION + 3;
        column = OFFSET_CORRECTION - 2;
    }

    for (let i = startLine; i <= endLine; i++) {
        if (i >= 0 && i < lines.length) {
            lines[i] = lines[i].replace(/\t/g, TAB_REPLACEMENT);
            lines[i] =
                (cutLeft > 0 && lines[i].length > cutLeft ? '\u2026' : '') +
                lines[i].substr(cutLeft, MAX_LINE_LENGTH - 2) +
                (lines[i].length > cutLeft + MAX_LINE_LENGTH - 1 ? '\u2026' : '');
        }
    }

    return [
        processLines(startLine, line),
        new Array(column + maxNumLength + 2).join('-') + '^',
        processLines(line, endLine)
    ].filter(Boolean)
        .join('\n')
        .replace(/^(\s+\d+\s+\|\n)+/, '')
        .replace(/\n(\s+\d+\s+\|)+$/, '');
}

function SyntaxError_SyntaxError(message, source, offset, line, column, baseLine = 1, baseColumn = 1) {
    const error = Object.assign(createCustomError('SyntaxError', message), {
        source,
        offset,
        line,
        column,
        sourceFragment(extraLines) {
            return sourceFragment({ source, line, column, baseLine, baseColumn }, isNaN(extraLines) ? 0 : extraLines);
        },
        get formattedMessage() {
            return (
                `Parse error: ${message}\n` +
                sourceFragment({ source, line, column, baseLine, baseColumn }, 2)
            );
        }
    });

    return error;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/tokenizer/adopt-buffer.js
const MIN_SIZE = 16 * 1024;

function adoptBuffer(buffer = null, size) {
    if (buffer === null || buffer.length < size) {
        return new Uint32Array(Math.max(size + 1024, MIN_SIZE));
    }

    return buffer;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/tokenizer/OffsetToLocation.js



const OffsetToLocation_N = 10;
const OffsetToLocation_F = 12;
const OffsetToLocation_R = 13;

function computeLinesAndColumns(host) {
    const source = host.source;
    const sourceLength = source.length;
    const startOffset = source.length > 0 ? isBOM(source.charCodeAt(0)) : 0;
    const lines = adoptBuffer(host.lines, sourceLength);
    const columns = adoptBuffer(host.columns, sourceLength);
    let line = host.startLine;
    let column = host.startColumn;

    for (let i = startOffset; i < sourceLength; i++) {
        const code = source.charCodeAt(i);

        lines[i] = line;
        columns[i] = column++;

        if (code === OffsetToLocation_N || code === OffsetToLocation_R || code === OffsetToLocation_F) {
            if (code === OffsetToLocation_R && i + 1 < sourceLength && source.charCodeAt(i + 1) === OffsetToLocation_N) {
                i++;
                lines[i] = line;
                columns[i] = column;
            }

            line++;
            column = 1;
        }
    }

    lines[sourceLength] = line;
    columns[sourceLength] = column;

    host.lines = lines;
    host.columns = columns;
    host.computed = true;
}

class OffsetToLocation {
    constructor(source, startOffset, startLine, startColumn) {
        this.setSource(source, startOffset, startLine, startColumn);
        this.lines = null;
        this.columns = null;
    }
    setSource(source = '', startOffset = 0, startLine = 1, startColumn = 1) {
        this.source = source;
        this.startOffset = startOffset;
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.computed = false;
    }
    getLocation(offset, filename) {
        if (!this.computed) {
            computeLinesAndColumns(this);
        }

        return {
            source: filename,
            offset: this.startOffset + offset,
            line: this.lines[offset],
            column: this.columns[offset]
        };
    }
    getLocationRange(start, end, filename) {
        if (!this.computed) {
            computeLinesAndColumns(this);
        }

        return {
            source: filename,
            start: {
                offset: this.startOffset + start,
                line: this.lines[start],
                column: this.columns[start]
            },
            end: {
                offset: this.startOffset + end,
                line: this.lines[end],
                column: this.columns[end]
            }
        };
    }
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/tokenizer/names.js
/* export default */ var names = ([
    'EOF-token',
    'ident-token',
    'function-token',
    'at-keyword-token',
    'hash-token',
    'string-token',
    'bad-string-token',
    'url-token',
    'bad-url-token',
    'delim-token',
    'number-token',
    'percentage-token',
    'dimension-token',
    'whitespace-token',
    'CDO-token',
    'CDC-token',
    'colon-token',
    'semicolon-token',
    'comma-token',
    '[-token',
    ']-token',
    '(-token',
    ')-token',
    '{-token',
    '}-token',
    'comment-token'
]);

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/tokenizer/TokenStream.js





const OFFSET_MASK = 0x00FFFFFF;
const TYPE_SHIFT = 24;
const BLOCK_OPEN_TOKEN = 1;
const BLOCK_CLOSE_TOKEN = 2;
const balancePair = new Uint8Array(32); // 32b of memory ought to be enough for anyone (any number of tokens)
balancePair[(/* inlined export .Function */2)] = (/* inlined export .RightParenthesis */22);
balancePair[(/* inlined export .LeftParenthesis */21)] = (/* inlined export .RightParenthesis */22);
balancePair[(/* inlined export .LeftSquareBracket */19)] = (/* inlined export .RightSquareBracket */20);
balancePair[(/* inlined export .LeftCurlyBracket */23)] = (/* inlined export .RightCurlyBracket */24);

const blockTokens = new Uint8Array(32);
blockTokens[(/* inlined export .Function */2)] = BLOCK_OPEN_TOKEN;
blockTokens[(/* inlined export .LeftParenthesis */21)] = BLOCK_OPEN_TOKEN;
blockTokens[(/* inlined export .LeftSquareBracket */19)] = BLOCK_OPEN_TOKEN;
blockTokens[(/* inlined export .LeftCurlyBracket */23)] = BLOCK_OPEN_TOKEN;
blockTokens[(/* inlined export .RightParenthesis */22)] = BLOCK_CLOSE_TOKEN;
blockTokens[(/* inlined export .RightSquareBracket */20)] = BLOCK_CLOSE_TOKEN;
blockTokens[(/* inlined export .RightCurlyBracket */24)] = BLOCK_CLOSE_TOKEN;

function boundIndex(index, min, max) {
    return index < min ? min : index > max ? max : index;
}

class TokenStream {
    constructor(source, tokenize) {
        this.setSource(source, tokenize);
    }
    reset() {
        this.eof = false;
        this.tokenIndex = -1;
        this.tokenType = 0;
        this.tokenStart = this.firstCharOffset;
        this.tokenEnd = this.firstCharOffset;
    }
    setSource(source = '', tokenize = () => {}) {
        source = String(source || '');

        const sourceLength = source.length;
        const offsetAndType = adoptBuffer(this.offsetAndType, source.length + 1); // +1 because of eof-token
        const balance = adoptBuffer(this.balance, source.length + 1);
        let tokenCount = 0;
        let firstCharOffset = -1;
        let balanceCloseType = 0;
        let balanceStart = source.length;

        // capture buffers
        this.offsetAndType = null;
        this.balance = null;
        balance.fill(0);

        tokenize(source, (type, start, end) => {
            const index = tokenCount++;

            // type & offset
            offsetAndType[index] = (type << TYPE_SHIFT) | end;

            if (firstCharOffset === -1) {
                firstCharOffset = start;
            }

            // balance
            balance[index] = balanceStart;

            if (type === balanceCloseType) {
                const prevBalanceStart = balance[balanceStart];

                // set reference to balance end for a block opener
                balance[balanceStart] = index;

                // pop state
                balanceStart = prevBalanceStart;
                balanceCloseType = balancePair[offsetAndType[prevBalanceStart] >> TYPE_SHIFT];
            } else if (this.isBlockOpenerTokenType(type)) { // check for FunctionToken, <(-token>, <[-token> and <{-token>
                // push state
                balanceStart = index;
                balanceCloseType = balancePair[type];
            }
        });

        // finalize buffers
        offsetAndType[tokenCount] = ((/* inlined export .EOF */0) << TYPE_SHIFT) | sourceLength; // <EOF-token>
        balance[tokenCount] = tokenCount; // prevents false positive balance match with any token

        // reverse references from balance start to end
        // tokens
        //   token:   a ( [ b c ] d e ) {
        //   index:   0 1 2 3 4 5 6 7 8 9
        // before
        //   balance: 0 8 5 2 2 2 1 1 1 0
        //            - > > < < < < < < -
        // after
        //   balance: 9 8 5 5 5 2 8 8 1 9
        //            > > > > > < > > < >
        for (let i = 0; i < tokenCount; i++) {
            const balanceStart = balance[i];

            if (balanceStart <= i) {
                const balanceEnd = balance[balanceStart];

                if (balanceEnd !== i) {
                    balance[i] = balanceEnd;
                }
            } else if (balanceStart > tokenCount) {
                balance[i] = tokenCount;
            }
        }

        // balance[0] = tokenCount;

        this.source = source;
        this.firstCharOffset = firstCharOffset === -1 ? 0 : firstCharOffset;
        this.tokenCount = tokenCount;
        this.offsetAndType = offsetAndType;
        this.balance = balance;

        this.reset();
        this.next();
    }

    lookupType(offset) {
        offset += this.tokenIndex;

        if (offset < this.tokenCount) {
            return this.offsetAndType[offset] >> TYPE_SHIFT;
        }

        return (/* inlined export .EOF */0);
    }
    lookupTypeNonSC(idx) {
        for (let offset = this.tokenIndex; offset < this.tokenCount; offset++) {
            const tokenType = this.offsetAndType[offset] >> TYPE_SHIFT;

            if (tokenType !== (/* inlined export .WhiteSpace */13) && tokenType !== (/* inlined export .Comment */25)) {
                if (idx-- === 0) {
                    return tokenType;
                }
            }
        }

        return (/* inlined export .EOF */0);
    }
    lookupOffset(offset) {
        offset += this.tokenIndex;

        if (offset < this.tokenCount) {
            return this.offsetAndType[offset - 1] & OFFSET_MASK;
        }

        return this.source.length;
    }
    lookupOffsetNonSC(idx) {
        for (let offset = this.tokenIndex; offset < this.tokenCount; offset++) {
            const tokenType = this.offsetAndType[offset] >> TYPE_SHIFT;

            if (tokenType !== (/* inlined export .WhiteSpace */13) && tokenType !== (/* inlined export .Comment */25)) {
                if (idx-- === 0) {
                    return offset - this.tokenIndex;
                }
            }
        }

        return (/* inlined export .EOF */0);
    }
    lookupValue(offset, referenceStr) {
        offset += this.tokenIndex;

        if (offset < this.tokenCount) {
            return cmpStr(
                this.source,
                this.offsetAndType[offset - 1] & OFFSET_MASK,
                this.offsetAndType[offset] & OFFSET_MASK,
                referenceStr
            );
        }

        return false;
    }
    getTokenStart(tokenIndex) {
        if (tokenIndex === this.tokenIndex) {
            return this.tokenStart;
        }

        if (tokenIndex > 0) {
            return tokenIndex < this.tokenCount
                ? this.offsetAndType[tokenIndex - 1] & OFFSET_MASK
                : this.offsetAndType[this.tokenCount] & OFFSET_MASK;
        }

        return this.firstCharOffset;
    }
    getTokenEnd(tokenIndex) {
        if (tokenIndex === this.tokenIndex) {
            return this.tokenEnd;
        }

        return this.offsetAndType[boundIndex(tokenIndex, 0, this.tokenCount)] & OFFSET_MASK;
    }
    getTokenType(tokenIndex) {
        if (tokenIndex === this.tokenIndex) {
            return this.tokenType;
        }

        return this.offsetAndType[boundIndex(tokenIndex, 0, this.tokenCount)] >> TYPE_SHIFT;
    }
    substrToCursor(start) {
        return this.source.substring(start, this.tokenStart);
    }

    isBlockOpenerTokenType(tokenType) {
        return blockTokens[tokenType] === BLOCK_OPEN_TOKEN;
    }
    isBlockCloserTokenType(tokenType) {
        return blockTokens[tokenType] === BLOCK_CLOSE_TOKEN;
    }
    getBlockTokenPairIndex(tokenIndex) {
        const type = this.getTokenType(tokenIndex);

        if (blockTokens[type] === 1) {
            // block open token
            const pairIndex = this.balance[tokenIndex];
            const closeType = this.getTokenType(pairIndex);

            return balancePair[type] === closeType ? pairIndex : -1;
        } else if (blockTokens[type] === 2) {
            // block close token
            const pairIndex = this.balance[tokenIndex];
            const openType = this.getTokenType(pairIndex);

            return balancePair[openType] === type ? pairIndex : -1;
        }

        return -1;
    }
    isBalanceEdge(tokenIndex) {
        return this.balance[this.tokenIndex] < tokenIndex;
    }

    isDelim(code, offset) {
        if (offset) {
            return (
                this.lookupType(offset) === (/* inlined export .Delim */9) &&
                this.source.charCodeAt(this.lookupOffset(offset)) === code
            );
        }

        return (
            this.tokenType === (/* inlined export .Delim */9) &&
            this.source.charCodeAt(this.tokenStart) === code
        );
    }

    skip(tokenCount) {
        let next = this.tokenIndex + tokenCount;

        if (next < this.tokenCount) {
            this.tokenIndex = next;
            this.tokenStart = this.offsetAndType[next - 1] & OFFSET_MASK;
            next = this.offsetAndType[next];
            this.tokenType = next >> TYPE_SHIFT;
            this.tokenEnd = next & OFFSET_MASK;
        } else {
            this.tokenIndex = this.tokenCount;
            this.next();
        }
    }
    next() {
        let next = this.tokenIndex + 1;

        if (next < this.tokenCount) {
            this.tokenIndex = next;
            this.tokenStart = this.tokenEnd;
            next = this.offsetAndType[next];
            this.tokenType = next >> TYPE_SHIFT;
            this.tokenEnd = next & OFFSET_MASK;
        } else {
            this.eof = true;
            this.tokenIndex = this.tokenCount;
            this.tokenType = (/* inlined export .EOF */0);
            this.tokenStart = this.tokenEnd = this.source.length;
        }
    }
    skipSC() {
        while (this.tokenType === (/* inlined export .WhiteSpace */13) || this.tokenType === (/* inlined export .Comment */25)) {
            this.next();
        }
    }
    skipUntilBalanced(startToken, stopConsume) {
        let cursor = startToken;
        let balanceEnd = 0;
        let offset = 0;

        loop:
        for (; cursor < this.tokenCount; cursor++) {
            balanceEnd = this.balance[cursor];

            // stop scanning on balance edge that points to offset before start token
            if (balanceEnd < startToken) {
                break loop;
            }

            offset = cursor > 0 ? this.offsetAndType[cursor - 1] & OFFSET_MASK : this.firstCharOffset;

            // check stop condition
            switch (stopConsume(this.source.charCodeAt(offset))) {
                case 1: // just stop
                    break loop;

                case 2: // stop & included
                    cursor++;
                    break loop;

                default:
                    // fast forward to the end of balanced block for an open block tokens
                    if (this.isBlockOpenerTokenType(this.offsetAndType[cursor] >> TYPE_SHIFT)) {
                        cursor = balanceEnd;
                    }
            }
        }

        this.skip(cursor - this.tokenIndex);
    }

    forEachToken(fn) {
        for (let i = 0, offset = this.firstCharOffset; i < this.tokenCount; i++) {
            const start = offset;
            const item = this.offsetAndType[i];
            const end = item & OFFSET_MASK;
            const type = item >> TYPE_SHIFT;

            offset = end;

            fn(type, start, end, i);
        }
    }
    dump() {
        const tokens = new Array(this.tokenCount);

        this.forEachToken((type, start, end, index) => {
            tokens[index] = {
                idx: index,
                type: names[type],
                chunk: this.source.substring(start, end),
                balance: this.balance[index]
            };
        });

        return tokens;
    }
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/parser/sequence.js


function sequence_readSequence(recognizer) {
    const children = this.createList();
    let space = false;
    const context = {
        recognizer
    };

    while (!this.eof) {
        switch (this.tokenType) {
            case (/* inlined export .Comment */25):
                this.next();
                continue;

            case (/* inlined export .WhiteSpace */13):
                space = true;
                this.next();
                continue;
        }

        let child = recognizer.getNode.call(this, context);

        if (child === undefined) {
            break;
        }

        if (space) {
            if (recognizer.onWhiteSpace) {
                recognizer.onWhiteSpace.call(this, child, children, context);
            }
            space = false;
        }

        children.push(child);
    }

    if (space && recognizer.onWhiteSpace) {
        recognizer.onWhiteSpace.call(this, null, children, context);
    }

    return children;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/parser/create.js





const NOOP = () => {};
const EXCLAMATIONMARK = 0x0021;  // U+0021 EXCLAMATION MARK (!)
const NUMBERSIGN = 0x0023;       // U+0023 NUMBER SIGN (#)
const SEMICOLON = 0x003B;        // U+003B SEMICOLON (;)
const LEFTCURLYBRACKET = 0x007B; // U+007B LEFT CURLY BRACKET ({)
const NULL = 0;

const arrayMethods = {
    createList() {
        return [];
    },
    createSingleNodeList(node) {
        return [node];
    },
    getFirstListNode(list) {
        return list && list[0] || null;
    },
    getLastListNode(list) {
        return list && list.length > 0 ? list[list.length - 1] : null;
    }
};

const listMethods = {
    createList() {
        return new List();
    },
    createSingleNodeList(node) {
        return new List().appendData(node);
    },
    getFirstListNode(list) {
        return list && list.first;
    },
    getLastListNode(list) {
        return list && list.last;
    }
};

function createParseContext(name) {
    return function() {
        return this[name]();
    };
}

function fetchParseValues(dict) {
    const result = Object.create(null);

    for (const name of Object.keys(dict)) {
        const item = dict[name];
        const fn = item.parse || item;

        if (fn) {
            result[name] = fn;
        }
    }

    return result;
}

function processConfig(config) {
    const parseConfig = {
        context: Object.create(null),
        features: Object.assign(Object.create(null), config.features),
        scope: Object.assign(Object.create(null), config.scope),
        atrule: fetchParseValues(config.atrule),
        pseudo: fetchParseValues(config.pseudo),
        node: fetchParseValues(config.node)
    };

    for (const [name, context] of Object.entries(config.parseContext)) {
        switch (typeof context) {
            case 'function':
                parseConfig.context[name] = context;
                break;

            case 'string':
                parseConfig.context[name] = createParseContext(context);
                break;
        }
    }

    return {
        config: parseConfig,
        ...parseConfig,
        ...parseConfig.node
    };
}

function createParser(config) {
    let source = '';
    let filename = '<unknown>';
    let needPositions = false;
    let onParseError = NOOP;
    let onParseErrorThrow = false;

    const locationMap = new OffsetToLocation();
    const parser = Object.assign(new TokenStream(), processConfig(config || {}), {
        parseAtrulePrelude: true,
        parseRulePrelude: true,
        parseValue: true,
        parseCustomProperty: false,

        readSequence: sequence_readSequence,

        consumeUntilBalanceEnd: () => 0,
        consumeUntilLeftCurlyBracket(code) {
            return code === LEFTCURLYBRACKET ? 1 : 0;
        },
        consumeUntilLeftCurlyBracketOrSemicolon(code) {
            return code === LEFTCURLYBRACKET || code === SEMICOLON ? 1 : 0;
        },
        consumeUntilExclamationMarkOrSemicolon(code) {
            return code === EXCLAMATIONMARK || code === SEMICOLON ? 1 : 0;
        },
        consumeUntilSemicolonIncluded(code) {
            return code === SEMICOLON ? 2 : 0;
        },

        createList: NOOP,
        createSingleNodeList: NOOP,
        getFirstListNode: NOOP,
        getLastListNode: NOOP,

        parseWithFallback(consumer, fallback) {
            const startIndex = this.tokenIndex;

            try {
                return consumer.call(this);
            } catch (e) {
                if (onParseErrorThrow) {
                    throw e;
                }

                this.skip(startIndex - this.tokenIndex);
                const fallbackNode = fallback.call(this);

                onParseErrorThrow = true;
                onParseError(e, fallbackNode);
                onParseErrorThrow = false;

                return fallbackNode;
            }
        },

        lookupNonWSType(offset) {
            let type;

            do {
                type = this.lookupType(offset++);
                if (type !== (/* inlined export .WhiteSpace */13) && type !== (/* inlined export .Comment */25)) {
                    return type;
                }
            } while (type !== NULL);

            return NULL;
        },

        charCodeAt(offset) {
            return offset >= 0 && offset < source.length ? source.charCodeAt(offset) : 0;
        },
        substring(offsetStart, offsetEnd) {
            return source.substring(offsetStart, offsetEnd);
        },
        substrToCursor(start) {
            return this.source.substring(start, this.tokenStart);
        },

        cmpChar(offset, charCode) {
            return cmpChar(source, offset, charCode);
        },
        cmpStr(offsetStart, offsetEnd, str) {
            return cmpStr(source, offsetStart, offsetEnd, str);
        },

        consume(tokenType) {
            const start = this.tokenStart;

            this.eat(tokenType);

            return this.substrToCursor(start);
        },
        consumeFunctionName() {
            const name = source.substring(this.tokenStart, this.tokenEnd - 1);

            this.eat((/* inlined export .Function */2));

            return name;
        },
        consumeNumber(type) {
            const number = source.substring(this.tokenStart, consumeNumber(source, this.tokenStart));

            this.eat(type);

            return number;
        },

        eat(tokenType) {
            if (this.tokenType !== tokenType) {
                const tokenName = names[tokenType].slice(0, -6).replace(/-/g, ' ').replace(/^./, m => m.toUpperCase());
                let message = `${/[[\](){}]/.test(tokenName) ? `"${tokenName}"` : tokenName} is expected`;
                let offset = this.tokenStart;

                // tweak message and offset
                switch (tokenType) {
                    case (/* inlined export .Ident */1):
                        // when identifier is expected but there is a function or url
                        if (this.tokenType === (/* inlined export .Function */2) || this.tokenType === (/* inlined export .Url */7)) {
                            offset = this.tokenEnd - 1;
                            message = 'Identifier is expected but function found';
                        } else {
                            message = 'Identifier is expected';
                        }
                        break;

                    case (/* inlined export .Hash */4):
                        if (this.isDelim(NUMBERSIGN)) {
                            this.next();
                            offset++;
                            message = 'Name is expected';
                        }
                        break;

                    case (/* inlined export .Percentage */11):
                        if (this.tokenType === (/* inlined export .Number */10)) {
                            offset = this.tokenEnd;
                            message = 'Percent sign is expected';
                        }
                        break;
                }

                this.error(message, offset);
            }

            this.next();
        },
        eatIdent(name) {
            if (this.tokenType !== (/* inlined export .Ident */1) || this.lookupValue(0, name) === false) {
                this.error(`Identifier "${name}" is expected`);
            }

            this.next();
        },
        eatDelim(code) {
            if (!this.isDelim(code)) {
                this.error(`Delim "${String.fromCharCode(code)}" is expected`);
            }

            this.next();
        },

        getLocation(start, end) {
            if (needPositions) {
                return locationMap.getLocationRange(
                    start,
                    end,
                    filename
                );
            }

            return null;
        },
        getLocationFromList(list) {
            if (needPositions) {
                const head = this.getFirstListNode(list);
                const tail = this.getLastListNode(list);
                return locationMap.getLocationRange(
                    head !== null ? head.loc.start.offset - locationMap.startOffset : this.tokenStart,
                    tail !== null ? tail.loc.end.offset - locationMap.startOffset : this.tokenStart,
                    filename
                );
            }

            return null;
        },

        error(message, offset) {
            const location = typeof offset !== 'undefined' && offset < source.length
                ? locationMap.getLocation(offset)
                : this.eof
                    ? locationMap.getLocation(findWhiteSpaceStart(source, source.length - 1))
                    : locationMap.getLocation(this.tokenStart);

            throw new SyntaxError_SyntaxError(
                message || 'Unexpected input',
                source,
                location.offset,
                location.line,
                location.column,
                locationMap.startLine,
                locationMap.startColumn
            );
        }
    });
    const createTokenIterateAPI = () => ({
        filename,
        source,
        tokenCount: parser.tokenCount,

        getTokenType: (index) =>
            parser.getTokenType(index),
        getTokenTypeName: (index) =>
            names[parser.getTokenType(index)],
        getTokenStart: (index) =>
            parser.getTokenStart(index),
        getTokenEnd: (index) =>
            parser.getTokenEnd(index),
        getTokenValue: (index) =>
            parser.source.substring(parser.getTokenStart(index), parser.getTokenEnd(index)),

        substring: (start, end) =>
            parser.source.substring(start, end),

        balance: parser.balance.subarray(0, parser.tokenCount + 1),
        isBlockOpenerTokenType: parser.isBlockOpenerTokenType,
        isBlockCloserTokenType: parser.isBlockCloserTokenType,
        getBlockTokenPairIndex: (index) =>
            parser.getBlockTokenPairIndex(index),

        getLocation: (offset) =>
            locationMap.getLocation(offset, filename),
        getRangeLocation: (start, end) =>
            locationMap.getLocationRange(start, end, filename)
    });

    const parse = function(source_, options) {
        source = source_;
        options = options || {};

        parser.setSource(source, tokenizer_tokenize);
        locationMap.setSource(
            source,
            options.offset,
            options.line,
            options.column
        );

        filename = options.filename || '<unknown>';
        needPositions = Boolean(options.positions);
        onParseError = typeof options.onParseError === 'function' ? options.onParseError : NOOP;
        onParseErrorThrow = false;

        parser.parseAtrulePrelude = 'parseAtrulePrelude' in options ? Boolean(options.parseAtrulePrelude) : true;
        parser.parseRulePrelude = 'parseRulePrelude' in options ? Boolean(options.parseRulePrelude) : true;
        parser.parseValue = 'parseValue' in options ? Boolean(options.parseValue) : true;
        parser.parseCustomProperty = 'parseCustomProperty' in options ? Boolean(options.parseCustomProperty) : false;

        const { context = 'default', list = true, onComment, onToken } = options;

        if (context in parser.context === false) {
            throw new Error('Unknown context `' + context + '`');
        }

        Object.assign(parser, list ? listMethods : arrayMethods);

        if (Array.isArray(onToken)) {
            parser.forEachToken((type, start, end) => {
                onToken.push({ type, start, end });
            });
        } else if (typeof onToken === 'function') {
            parser.forEachToken(onToken.bind(createTokenIterateAPI()));
        }

        if (typeof onComment === 'function') {
            parser.forEachToken((type, start, end) => {
                if (type === (/* inlined export .Comment */25)) {
                    const loc = parser.getLocation(start, end);
                    const value = cmpStr(source, end - 2, end, '*/')
                        ? source.slice(start + 2, end - 2)
                        : source.slice(start + 2, end);

                    onComment(value, loc);
                }
            });
        }

        const ast = parser.context[context].call(parser, options);

        if (!parser.eof) {
            parser.error();
        }

        return ast;
    };

    return Object.assign(parse, {
        SyntaxError: SyntaxError_SyntaxError,
        config: parser.config
    });
};

// EXTERNAL MODULE: ../../node_modules/source-map-js/lib/source-map-generator.js
var source_map_generator = __webpack_require__(3300);
;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/generator/sourceMap.js


const trackNodes = new Set(['Atrule', 'Selector', 'Declaration']);

function generateSourceMap(handlers) {
    const map = new source_map_generator/* .SourceMapGenerator */.x();
    const generated = {
        line: 1,
        column: 0
    };
    const original = {
        line: 0, // should be zero to add first mapping
        column: 0
    };
    const activatedGenerated = {
        line: 1,
        column: 0
    };
    const activatedMapping = {
        generated: activatedGenerated
    };
    let line = 1;
    let column = 0;
    let sourceMappingActive = false;

    const origHandlersNode = handlers.node;
    handlers.node = function(node) {
        if (node.loc && node.loc.start && trackNodes.has(node.type)) {
            const nodeLine = node.loc.start.line;
            const nodeColumn = node.loc.start.column - 1;

            if (original.line !== nodeLine ||
                original.column !== nodeColumn) {
                original.line = nodeLine;
                original.column = nodeColumn;

                generated.line = line;
                generated.column = column;

                if (sourceMappingActive) {
                    sourceMappingActive = false;
                    if (generated.line !== activatedGenerated.line ||
                        generated.column !== activatedGenerated.column) {
                        map.addMapping(activatedMapping);
                    }
                }

                sourceMappingActive = true;
                map.addMapping({
                    source: node.loc.source,
                    original,
                    generated
                });
            }
        }

        origHandlersNode.call(this, node);

        if (sourceMappingActive && trackNodes.has(node.type)) {
            activatedGenerated.line = line;
            activatedGenerated.column = column;
        }
    };

    const origHandlersEmit = handlers.emit;
    handlers.emit = function(value, type, auto) {
        for (let i = 0; i < value.length; i++) {
            if (value.charCodeAt(i) === 10) { // \n
                line++;
                column = 0;
            } else {
                column++;
            }
        }

        origHandlersEmit(value, type, auto);
    };

    const origHandlersResult = handlers.result;
    handlers.result = function() {
        if (sourceMappingActive) {
            map.addMapping(activatedMapping);
        }

        return {
            css: origHandlersResult(),
            map
        };
    };

    return handlers;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/generator/token-before.js


const PLUSSIGN = 0x002B;    // U+002B PLUS SIGN (+)
const HYPHENMINUS = 0x002D; // U+002D HYPHEN-MINUS (-)

// code:
// 0xxxxxxx x0000000 - char code (0x80 for non-ASCII) or delim value
// 00000000 0xxxxxx0 - token type (0 for delim, 1 for token)
// 00000000 0000000x - reserved for carriage emit flag (0 for no space, 1 for space)
const token_before_code = (type, value) => {
    if (type === (/* inlined export .Delim */9)) {
        type = value;
    }

    if (typeof type === 'string') {
        type = Math.min(type.charCodeAt(0), 0x80) << 6; // replace non-ASCII with 0x80
    }

    return type << 1;
};

// https://www.w3.org/TR/css-syntax-3/#serialization
// The only requirement for serialization is that it must "round-trip" with parsing,
// that is, parsing the stylesheet must produce the same data structures as parsing,
// serializing, and parsing again, except for consecutive <whitespace-token>s,
// which may be collapsed into a single token.

const specPairs = [
    [(/* inlined export .Ident */1), (/* inlined export .Ident */1)],
    [(/* inlined export .Ident */1), (/* inlined export .Function */2)],
    [(/* inlined export .Ident */1), (/* inlined export .Url */7)],
    [(/* inlined export .Ident */1), (/* inlined export .BadUrl */8)],
    [(/* inlined export .Ident */1), '-'],
    [(/* inlined export .Ident */1), (/* inlined export .Number */10)],
    [(/* inlined export .Ident */1), (/* inlined export .Percentage */11)],
    [(/* inlined export .Ident */1), (/* inlined export .Dimension */12)],
    [(/* inlined export .Ident */1), (/* inlined export .CDC */15)],
    [(/* inlined export .Ident */1), (/* inlined export .LeftParenthesis */21)],

    [(/* inlined export .AtKeyword */3), (/* inlined export .Ident */1)],
    [(/* inlined export .AtKeyword */3), (/* inlined export .Function */2)],
    [(/* inlined export .AtKeyword */3), (/* inlined export .Url */7)],
    [(/* inlined export .AtKeyword */3), (/* inlined export .BadUrl */8)],
    [(/* inlined export .AtKeyword */3), '-'],
    [(/* inlined export .AtKeyword */3), (/* inlined export .Number */10)],
    [(/* inlined export .AtKeyword */3), (/* inlined export .Percentage */11)],
    [(/* inlined export .AtKeyword */3), (/* inlined export .Dimension */12)],
    [(/* inlined export .AtKeyword */3), (/* inlined export .CDC */15)],

    [(/* inlined export .Hash */4), (/* inlined export .Ident */1)],
    [(/* inlined export .Hash */4), (/* inlined export .Function */2)],
    [(/* inlined export .Hash */4), (/* inlined export .Url */7)],
    [(/* inlined export .Hash */4), (/* inlined export .BadUrl */8)],
    [(/* inlined export .Hash */4), '-'],
    [(/* inlined export .Hash */4), (/* inlined export .Number */10)],
    [(/* inlined export .Hash */4), (/* inlined export .Percentage */11)],
    [(/* inlined export .Hash */4), (/* inlined export .Dimension */12)],
    [(/* inlined export .Hash */4), (/* inlined export .CDC */15)],

    [(/* inlined export .Dimension */12), (/* inlined export .Ident */1)],
    [(/* inlined export .Dimension */12), (/* inlined export .Function */2)],
    [(/* inlined export .Dimension */12), (/* inlined export .Url */7)],
    [(/* inlined export .Dimension */12), (/* inlined export .BadUrl */8)],
    [(/* inlined export .Dimension */12), '-'],
    [(/* inlined export .Dimension */12), (/* inlined export .Number */10)],
    [(/* inlined export .Dimension */12), (/* inlined export .Percentage */11)],
    [(/* inlined export .Dimension */12), (/* inlined export .Dimension */12)],
    [(/* inlined export .Dimension */12), (/* inlined export .CDC */15)],

    ['#', (/* inlined export .Ident */1)],
    ['#', (/* inlined export .Function */2)],
    ['#', (/* inlined export .Url */7)],
    ['#', (/* inlined export .BadUrl */8)],
    ['#', '-'],
    ['#', (/* inlined export .Number */10)],
    ['#', (/* inlined export .Percentage */11)],
    ['#', (/* inlined export .Dimension */12)],
    ['#', (/* inlined export .CDC */15)], // https://github.com/w3c/csswg-drafts/pull/6874

    ['-', (/* inlined export .Ident */1)],
    ['-', (/* inlined export .Function */2)],
    ['-', (/* inlined export .Url */7)],
    ['-', (/* inlined export .BadUrl */8)],
    ['-', '-'],
    ['-', (/* inlined export .Number */10)],
    ['-', (/* inlined export .Percentage */11)],
    ['-', (/* inlined export .Dimension */12)],
    ['-', (/* inlined export .CDC */15)], // https://github.com/w3c/csswg-drafts/pull/6874

    [(/* inlined export .Number */10), (/* inlined export .Ident */1)],
    [(/* inlined export .Number */10), (/* inlined export .Function */2)],
    [(/* inlined export .Number */10), (/* inlined export .Url */7)],
    [(/* inlined export .Number */10), (/* inlined export .BadUrl */8)],
    [(/* inlined export .Number */10), (/* inlined export .Number */10)],
    [(/* inlined export .Number */10), (/* inlined export .Percentage */11)],
    [(/* inlined export .Number */10), (/* inlined export .Dimension */12)],
    [(/* inlined export .Number */10), '%'],
    [(/* inlined export .Number */10), (/* inlined export .CDC */15)], // https://github.com/w3c/csswg-drafts/pull/6874

    ['@', (/* inlined export .Ident */1)],
    ['@', (/* inlined export .Function */2)],
    ['@', (/* inlined export .Url */7)],
    ['@', (/* inlined export .BadUrl */8)],
    ['@', '-'],
    ['@', (/* inlined export .CDC */15)], // https://github.com/w3c/csswg-drafts/pull/6874

    ['.', (/* inlined export .Number */10)],
    ['.', (/* inlined export .Percentage */11)],
    ['.', (/* inlined export .Dimension */12)],

    ['+', (/* inlined export .Number */10)],
    ['+', (/* inlined export .Percentage */11)],
    ['+', (/* inlined export .Dimension */12)],

    ['/', '*']
];
// validate with scripts/generate-safe
const safePairs = specPairs.concat([
    [(/* inlined export .Ident */1), (/* inlined export .Hash */4)],

    [(/* inlined export .Dimension */12), (/* inlined export .Hash */4)],

    [(/* inlined export .Hash */4), (/* inlined export .Hash */4)],

    [(/* inlined export .AtKeyword */3), (/* inlined export .LeftParenthesis */21)],
    [(/* inlined export .AtKeyword */3), (/* inlined export .String */5)],
    [(/* inlined export .AtKeyword */3), (/* inlined export .Colon */16)],

    [(/* inlined export .Percentage */11), (/* inlined export .Percentage */11)],
    [(/* inlined export .Percentage */11), (/* inlined export .Dimension */12)],
    [(/* inlined export .Percentage */11), (/* inlined export .Function */2)],
    [(/* inlined export .Percentage */11), '-'],

    [(/* inlined export .RightParenthesis */22), (/* inlined export .Ident */1)],
    [(/* inlined export .RightParenthesis */22), (/* inlined export .Function */2)],
    [(/* inlined export .RightParenthesis */22), (/* inlined export .Percentage */11)],
    [(/* inlined export .RightParenthesis */22), (/* inlined export .Dimension */12)],
    [(/* inlined export .RightParenthesis */22), (/* inlined export .Hash */4)],
    [(/* inlined export .RightParenthesis */22), '-']
]);

function createMap(pairs) {
    const isWhiteSpaceRequired = new Set(
        pairs.map(([prev, next]) => (token_before_code(prev) << 16 | token_before_code(next)))
    );

    return function(prevCode, type, value) {
        const nextCode = token_before_code(type, value);
        const nextCharCode = value.charCodeAt(0);
        const emitWs =
            (nextCharCode === HYPHENMINUS &&
                type !== (/* inlined export .Ident */1) &&
                type !== (/* inlined export .Function */2) &&
                type !== (/* inlined export .CDC */15)) ||
            (nextCharCode === PLUSSIGN)
                ? isWhiteSpaceRequired.has((prevCode & 0xFFFE) << 16 | nextCharCode << 7)
                : isWhiteSpaceRequired.has((prevCode & 0xFFFE) << 16 | nextCode);

        return nextCode | emitWs;
    };
}

const spec = createMap(specPairs);
const safe = createMap(safePairs);

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/generator/create.js




const REVERSESOLIDUS = 0x005c; // U+005C REVERSE SOLIDUS (\)

function processChildren(node, delimeter) {
    if (typeof delimeter === 'function') {
        let prev = null;

        node.children.forEach(node => {
            if (prev !== null) {
                delimeter.call(this, prev);
            }

            this.node(node);
            prev = node;
        });

        return;
    }

    node.children.forEach(this.node, this);
}

function createGenerator(config) {
    const types = new Map();

    for (let [name, item] of Object.entries(config.node)) {
        const fn = item.generate || item;

        if (typeof fn === 'function') {
            types.set(name, item.generate || item);
        }
    }

    return function(node, options) {
        let buffer = '';
        let prevCode = 0;
        let handlers = {
            node(node) {
                if (types.has(node.type)) {
                    types.get(node.type).call(publicApi, node);
                } else {
                    throw new Error('Unknown node type: ' + node.type);
                }
            },
            tokenBefore: safe,
            token(type, value, suppressAutoWhiteSpace) {
                prevCode = this.tokenBefore(prevCode, type, value);

                if (!suppressAutoWhiteSpace && prevCode & 1) {
                    this.emit(' ', (/* inlined export .WhiteSpace */13), true);
                }

                this.emit(value, type, false);

                if (type === (/* inlined export .Delim */9) && value.charCodeAt(0) === REVERSESOLIDUS) {
                    this.emit('\n', (/* inlined export .WhiteSpace */13), true);
                }
            },
            emit(value) {
                buffer += value;
            },
            result() {
                return buffer;
            }
        };

        if (options) {
            if (typeof options.decorator === 'function') {
                handlers = options.decorator(handlers);
            }

            if (options.sourceMap) {
                handlers = generateSourceMap(handlers);
            }

            if (options.mode in token_before_namespaceObject) {
                handlers.tokenBefore = token_before_namespaceObject[options.mode];
            }
        }

        const publicApi = {
            node: (node) => handlers.node(node),
            children: processChildren,
            token: (type, value) => handlers.token(type, value),
            tokenize: (raw) =>
                tokenizer_tokenize(raw, (type, start, end) => {
                    handlers.token(
                        type,
                        raw.slice(start, end),
                        start !== 0 // suppress auto whitespace for internal value tokens
                    );
                })
        };

        handlers.node(node);

        return handlers.result();
    };
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/convertor/create.js


function createConvertor(walk) {
    return {
        fromPlainObject(ast) {
            walk(ast, {
                enter(node) {
                    if (node.children && node.children instanceof List === false) {
                        node.children = new List().fromArray(node.children);
                    }
                }
            });

            return ast;
        },
        toPlainObject(ast) {
            walk(ast, {
                leave(node) {
                    if (node.children && node.children instanceof List) {
                        node.children = node.children.toArray();
                    }
                }
            });

            return ast;
        }
    };
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/walker/create.js
const { hasOwnProperty: create_hasOwnProperty } = Object.prototype;
const noop = function() {};

function ensureFunction(value) {
    return typeof value === 'function' ? value : noop;
}

function invokeForType(fn, type) {
    return function(node, item, list) {
        if (node.type === type) {
            fn.call(this, node, item, list);
        }
    };
}

function getWalkersFromStructure(name, nodeType) {
    const structure = nodeType.structure;
    const walkers = [];

    for (const key in structure) {
        if (create_hasOwnProperty.call(structure, key) === false) {
            continue;
        }

        let fieldTypes = structure[key];
        const walker = {
            name: key,
            type: false,
            nullable: false
        };

        if (!Array.isArray(fieldTypes)) {
            fieldTypes = [fieldTypes];
        }

        for (const fieldType of fieldTypes) {
            if (fieldType === null) {
                walker.nullable = true;
            } else if (typeof fieldType === 'string') {
                walker.type = 'node';
            } else if (Array.isArray(fieldType)) {
                walker.type = 'list';
            }
        }

        if (walker.type) {
            walkers.push(walker);
        }
    }

    if (walkers.length) {
        return {
            context: nodeType.walkContext,
            fields: walkers
        };
    }

    return null;
}

function getTypesFromConfig(config) {
    const types = {};

    for (const name in config.node) {
        if (create_hasOwnProperty.call(config.node, name)) {
            const nodeType = config.node[name];

            if (!nodeType.structure) {
                throw new Error('Missed `structure` field in `' + name + '` node type definition');
            }

            types[name] = getWalkersFromStructure(name, nodeType);
        }
    }

    return types;
}

function createTypeIterator(config, reverse) {
    const fields = config.fields.slice();
    const contextName = config.context;
    const useContext = typeof contextName === 'string';

    if (reverse) {
        fields.reverse();
    }

    return function(node, context, walk, walkReducer) {
        let prevContextValue;

        if (useContext) {
            prevContextValue = context[contextName];
            context[contextName] = node;
        }

        for (const field of fields) {
            const ref = node[field.name];

            if (!field.nullable || ref) {
                if (field.type === 'list') {
                    const breakWalk = reverse
                        ? ref.reduceRight(walkReducer, false)
                        : ref.reduce(walkReducer, false);

                    if (breakWalk) {
                        return true;
                    }
                } else if (walk(ref)) {
                    return true;
                }
            }
        }

        if (useContext) {
            context[contextName] = prevContextValue;
        }
    };
}

function createFastTraveralMap({
    StyleSheet,
    Atrule,
    Rule,
    Block,
    DeclarationList
}) {
    return {
        Atrule: {
            StyleSheet,
            Atrule,
            Rule,
            Block
        },
        Rule: {
            StyleSheet,
            Atrule,
            Rule,
            Block
        },
        Declaration: {
            StyleSheet,
            Atrule,
            Rule,
            Block,
            DeclarationList
        }
    };
}

function createWalker(config) {
    const types = getTypesFromConfig(config);
    const iteratorsNatural = {};
    const iteratorsReverse = {};
    const breakWalk = Symbol('break-walk');
    const skipNode = Symbol('skip-node');

    for (const name in types) {
        if (create_hasOwnProperty.call(types, name) && types[name] !== null) {
            iteratorsNatural[name] = createTypeIterator(types[name], false);
            iteratorsReverse[name] = createTypeIterator(types[name], true);
        }
    }

    const fastTraversalIteratorsNatural = createFastTraveralMap(iteratorsNatural);
    const fastTraversalIteratorsReverse = createFastTraveralMap(iteratorsReverse);

    const walk = function(root, options) {
        function walkNode(node, item, list) {
            const enterRet = enter.call(context, node, item, list);

            if (enterRet === breakWalk) {
                return true;
            }

            if (enterRet === skipNode) {
                return false;
            }

            if (iterators.hasOwnProperty(node.type)) {
                if (iterators[node.type](node, context, walkNode, walkReducer)) {
                    return true;
                }
            }

            if (leave.call(context, node, item, list) === breakWalk) {
                return true;
            }

            return false;
        }

        let enter = noop;
        let leave = noop;
        let iterators = iteratorsNatural;
        let walkReducer = (ret, data, item, list) => ret || walkNode(data, item, list);
        const context = {
            break: breakWalk,
            skip: skipNode,

            root,
            stylesheet: null,
            atrule: null,
            atrulePrelude: null,
            rule: null,
            selector: null,
            block: null,
            declaration: null,
            function: null
        };

        if (typeof options === 'function') {
            enter = options;
        } else if (options) {
            enter = ensureFunction(options.enter);
            leave = ensureFunction(options.leave);

            if (options.reverse) {
                iterators = iteratorsReverse;
            }

            if (options.visit) {
                if (fastTraversalIteratorsNatural.hasOwnProperty(options.visit)) {
                    iterators = options.reverse
                        ? fastTraversalIteratorsReverse[options.visit]
                        : fastTraversalIteratorsNatural[options.visit];
                } else if (!types.hasOwnProperty(options.visit)) {
                    throw new Error('Bad value `' + options.visit + '` for `visit` option (should be: ' + Object.keys(types).sort().join(', ') + ')');
                }

                enter = invokeForType(enter, options.visit);
                leave = invokeForType(leave, options.visit);
            }
        }

        if (enter === noop && leave === noop) {
            throw new Error('Neither `enter` nor `leave` walker handler is set or both aren\'t a function');
        }

        walkNode(root);
    };

    walk.break = breakWalk;
    walk.skip = skipNode;

    walk.find = function(ast, fn) {
        let found = null;

        walk(ast, function(node, item, list) {
            if (fn.call(this, node, item, list)) {
                found = node;
                return breakWalk;
            }
        });

        return found;
    };

    walk.findLast = function(ast, fn) {
        let found = null;

        walk(ast, {
            reverse: true,
            enter(node, item, list) {
                if (fn.call(this, node, item, list)) {
                    found = node;
                    return breakWalk;
                }
            }
        });

        return found;
    };

    walk.findAll = function(ast, fn) {
        const found = [];

        walk(ast, function(node, item, list) {
            if (fn.call(this, node, item, list)) {
                found.push(node);
            }
        });

        return found;
    };

    return walk;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/definition-syntax/generate.js
function generate_noop(value) {
    return value;
}

function generateMultiplier(multiplier) {
    const { min, max, comma } = multiplier;

    if (min === 0 && max === 0) {
        return comma ? '#?' : '*';
    }

    if (min === 0 && max === 1) {
        return '?';
    }

    if (min === 1 && max === 0) {
        return comma ? '#' : '+';
    }

    if (min === 1 && max === 1) {
        return '';
    }

    return (
        (comma ? '#' : '') +
        (min === max
            ? '{' + min + '}'
            : '{' + min + ',' + (max !== 0 ? max : '') + '}'
        )
    );
}

function generateTypeOpts(node) {
    switch (node.type) {
        case 'Range':
            return (
                ' [' +
                (node.min === null ? '-∞' : node.min) +
                ',' +
                (node.max === null ? '∞' : node.max) +
                ']'
            );

        default:
            throw new Error('Unknown node type `' + node.type + '`');
    }
}

function generateSequence(node, decorate, forceBraces, compact) {
    const combinator = node.combinator === ' ' || compact ? node.combinator : ' ' + node.combinator + ' ';
    const result = node.terms
        .map(term => internalGenerate(term, decorate, forceBraces, compact))
        .join(combinator);

    if (node.explicit || forceBraces) {
        return (compact || result[0] === ',' ? '[' : '[ ') + result + (compact ? ']' : ' ]');
    }

    return result;
}

function internalGenerate(node, decorate, forceBraces, compact) {
    let result;

    switch (node.type) {
        case 'Group':
            result =
                generateSequence(node, decorate, forceBraces, compact) +
                (node.disallowEmpty ? '!' : '');
            break;

        case 'Multiplier':
            // return since node is a composition
            return (
                internalGenerate(node.term, decorate, forceBraces, compact) +
                decorate(generateMultiplier(node), node)
            );

        case 'Boolean':
            result = '<boolean-expr[' + internalGenerate(node.term, decorate, forceBraces, compact) + ']>';
            break;

        case 'Type':
            result = '<' + node.name + (node.opts ? decorate(generateTypeOpts(node.opts), node.opts) : '') + '>';
            break;

        case 'Property':
            result = '<\'' + node.name + '\'>';
            break;

        case 'Keyword':
            result = node.name;
            break;

        case 'AtKeyword':
            result = '@' + node.name;
            break;

        case 'Function':
            result = node.name + '(';
            break;

        case 'String':
        case 'Token':
            result = node.value;
            break;

        case 'Comma':
            result = ',';
            break;

        default:
            throw new Error('Unknown node type `' + node.type + '`');
    }

    return decorate(result, node);
}

function generate_generate(node, options) {
    let decorate = generate_noop;
    let forceBraces = false;
    let compact = false;

    if (typeof options === 'function') {
        decorate = options;
    } else if (options) {
        forceBraces = Boolean(options.forceBraces);
        compact = Boolean(options.compact);
        if (typeof options.decorate === 'function') {
            decorate = options.decorate;
        }
    }

    return internalGenerate(node, decorate, forceBraces, compact);
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/error.js



const defaultLoc = { offset: 0, line: 1, column: 1 };

function locateMismatch(matchResult, node) {
    const tokens = matchResult.tokens;
    const longestMatch = matchResult.longestMatch;
    const mismatchNode = longestMatch < tokens.length ? tokens[longestMatch].node || null : null;
    const badNode = mismatchNode !== node ? mismatchNode : null;
    let mismatchOffset = 0;
    let mismatchLength = 0;
    let entries = 0;
    let css = '';
    let start;
    let end;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].value;

        if (i === longestMatch) {
            mismatchLength = token.length;
            mismatchOffset = css.length;
        }

        if (badNode !== null && tokens[i].node === badNode) {
            if (i <= longestMatch) {
                entries++;
            } else {
                entries = 0;
            }
        }

        css += token;
    }

    if (longestMatch === tokens.length || entries > 1) { // last
        start = fromLoc(badNode || node, 'end') || buildLoc(defaultLoc, css);
        end = buildLoc(start);
    } else {
        start = fromLoc(badNode, 'start') ||
            buildLoc(fromLoc(node, 'start') || defaultLoc, css.slice(0, mismatchOffset));
        end = fromLoc(badNode, 'end') ||
            buildLoc(start, css.substr(mismatchOffset, mismatchLength));
    }

    return {
        css,
        mismatchOffset,
        mismatchLength,
        start,
        end
    };
}

function fromLoc(node, point) {
    const value = node && node.loc && node.loc[point];

    if (value) {
        return 'line' in value ? buildLoc(value) : value;
    }

    return null;
}

function buildLoc({ offset, line, column }, extra) {
    const loc = {
        offset,
        line,
        column
    };

    if (extra) {
        const lines = extra.split(/\n|\r\n?|\f/);

        loc.offset += extra.length;
        loc.line += lines.length - 1;
        loc.column = lines.length === 1 ? loc.column + extra.length : lines.pop().length + 1;
    }

    return loc;
}

const SyntaxReferenceError = function(type, referenceName) {
    const error = createCustomError(
        'SyntaxReferenceError',
        type + (referenceName ? ' `' + referenceName + '`' : '')
    );

    error.reference = referenceName;

    return error;
};

const SyntaxMatchError = function(message, syntax, node, matchResult) {
    const error = createCustomError('SyntaxMatchError', message);
    const {
        css,
        mismatchOffset,
        mismatchLength,
        start,
        end
    } = locateMismatch(matchResult, node);

    error.rawMessage = message;
    error.syntax = syntax ? generate_generate(syntax) : '<generic>';
    error.css = css;
    error.mismatchOffset = mismatchOffset;
    error.mismatchLength = mismatchLength;
    error.message = message + '\n' +
        '  syntax: ' + error.syntax + '\n' +
        '   value: ' + (css || '<empty string>') + '\n' +
        '  --------' + new Array(error.mismatchOffset + 1).join('-') + '^';

    Object.assign(error, start);
    error.loc = {
        source: (node && node.loc && node.loc.source) || '<unknown>',
        start,
        end
    };

    return error;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/utils/names.js
const keywords = new Map();
const properties = new Map();
const names_HYPHENMINUS = 45; // '-'.charCodeAt()

const names_keyword = getKeywordDescriptor;
const names_property = getPropertyDescriptor;
const vendorPrefix = (/* unused pure expression or super */ null && (getVendorPrefix));
function isCustomProperty(str, offset) {
    offset = offset || 0;

    return str.length - offset >= 2 &&
           str.charCodeAt(offset) === names_HYPHENMINUS &&
           str.charCodeAt(offset + 1) === names_HYPHENMINUS;
}

function getVendorPrefix(str, offset) {
    offset = offset || 0;

    // verdor prefix should be at least 3 chars length
    if (str.length - offset >= 3) {
        // vendor prefix starts with hyper minus following non-hyper minus
        if (str.charCodeAt(offset) === names_HYPHENMINUS &&
            str.charCodeAt(offset + 1) !== names_HYPHENMINUS) {
            // vendor prefix should contain a hyper minus at the ending
            const secondDashIndex = str.indexOf('-', offset + 2);

            if (secondDashIndex !== -1) {
                return str.substring(offset, secondDashIndex + 1);
            }
        }
    }

    return '';
}

function getKeywordDescriptor(keyword) {
    if (keywords.has(keyword)) {
        return keywords.get(keyword);
    }

    const name = keyword.toLowerCase();
    let descriptor = keywords.get(name);

    if (descriptor === undefined) {
        const custom = isCustomProperty(name, 0);
        const vendor = !custom ? getVendorPrefix(name, 0) : '';
        descriptor = Object.freeze({
            basename: name.substr(vendor.length),
            name,
            prefix: vendor,
            vendor,
            custom
        });
    }

    keywords.set(keyword, descriptor);

    return descriptor;
}

function getPropertyDescriptor(property) {
    if (properties.has(property)) {
        return properties.get(property);
    }

    let name = property;
    let hack = property[0];

    if (hack === '/') {
        hack = property[1] === '/' ? '//' : '/';
    } else if (hack !== '_' &&
               hack !== '*' &&
               hack !== '$' &&
               hack !== '#' &&
               hack !== '+' &&
               hack !== '&') {
        hack = '';
    }

    const custom = isCustomProperty(name, hack.length);

    // re-use result when possible (the same as for lower case)
    if (!custom) {
        name = name.toLowerCase();
        if (properties.has(name)) {
            const descriptor = properties.get(name);
            properties.set(property, descriptor);
            return descriptor;
        }
    }

    const vendor = !custom ? getVendorPrefix(name, hack.length) : '';
    const prefix = name.substr(0, hack.length + vendor.length);
    const descriptor = Object.freeze({
        basename: name.substr(prefix.length),
        name: name.substr(hack.length),
        hack,
        vendor,
        prefix,
        custom
    });

    properties.set(property, descriptor);

    return descriptor;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/generic-const.js
// https://drafts.csswg.org/css-cascade-5/
const cssWideKeywords = [
    'initial',
    'inherit',
    'unset',
    'revert',
    'revert-layer'
];

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/generic-an-plus-b.js


const generic_an_plus_b_PLUSSIGN = 0x002B;    // U+002B PLUS SIGN (+)
const generic_an_plus_b_HYPHENMINUS = 0x002D; // U+002D HYPHEN-MINUS (-)
const generic_an_plus_b_N = 0x006E;           // U+006E LATIN SMALL LETTER N (n)
const DISALLOW_SIGN = true;
const ALLOW_SIGN = false;

function isDelim(token, code) {
    return token !== null && token.type === (/* inlined export .Delim */9) && token.value.charCodeAt(0) === code;
}

function skipSC(token, offset, getNextToken) {
    while (token !== null && (token.type === (/* inlined export .WhiteSpace */13) || token.type === (/* inlined export .Comment */25))) {
        token = getNextToken(++offset);
    }

    return offset;
}

function checkInteger(token, valueOffset, disallowSign, offset) {
    if (!token) {
        return 0;
    }

    const code = token.value.charCodeAt(valueOffset);

    if (code === generic_an_plus_b_PLUSSIGN || code === generic_an_plus_b_HYPHENMINUS) {
        if (disallowSign) {
            // Number sign is not allowed
            return 0;
        }
        valueOffset++;
    }

    for (; valueOffset < token.value.length; valueOffset++) {
        if (!isDigit(token.value.charCodeAt(valueOffset))) {
            // Integer is expected
            return 0;
        }
    }

    return offset + 1;
}

// ... <signed-integer>
// ... ['+' | '-'] <signless-integer>
function consumeB(token, offset_, getNextToken) {
    let sign = false;
    let offset = skipSC(token, offset_, getNextToken);

    token = getNextToken(offset);

    if (token === null) {
        return offset_;
    }

    if (token.type !== (/* inlined export .Number */10)) {
        if (isDelim(token, generic_an_plus_b_PLUSSIGN) || isDelim(token, generic_an_plus_b_HYPHENMINUS)) {
            sign = true;
            offset = skipSC(getNextToken(++offset), offset, getNextToken);
            token = getNextToken(offset);

            if (token === null || token.type !== (/* inlined export .Number */10)) {
                return 0;
            }
        } else {
            return offset_;
        }
    }

    if (!sign) {
        const code = token.value.charCodeAt(0);
        if (code !== generic_an_plus_b_PLUSSIGN && code !== generic_an_plus_b_HYPHENMINUS) {
            // Number sign is expected
            return 0;
        }
    }

    return checkInteger(token, sign ? 0 : 1, sign, offset);
}

// An+B microsyntax https://www.w3.org/TR/css-syntax-3/#anb
function anPlusB(token, getNextToken) {
    /* eslint-disable brace-style*/
    let offset = 0;

    if (!token) {
        return 0;
    }

    // <integer>
    if (token.type === (/* inlined export .Number */10)) {
        return checkInteger(token, 0, ALLOW_SIGN, offset); // b
    }

    // -n
    // -n <signed-integer>
    // -n ['+' | '-'] <signless-integer>
    // -n- <signless-integer>
    // <dashndashdigit-ident>
    else if (token.type === (/* inlined export .Ident */1) && token.value.charCodeAt(0) === generic_an_plus_b_HYPHENMINUS) {
        // expect 1st char is N
        if (!cmpChar(token.value, 1, generic_an_plus_b_N)) {
            return 0;
        }

        switch (token.value.length) {
            // -n
            // -n <signed-integer>
            // -n ['+' | '-'] <signless-integer>
            case 2:
                return consumeB(getNextToken(++offset), offset, getNextToken);

            // -n- <signless-integer>
            case 3:
                if (token.value.charCodeAt(2) !== generic_an_plus_b_HYPHENMINUS) {
                    return 0;
                }

                offset = skipSC(getNextToken(++offset), offset, getNextToken);
                token = getNextToken(offset);

                return checkInteger(token, 0, DISALLOW_SIGN, offset);

            // <dashndashdigit-ident>
            default:
                if (token.value.charCodeAt(2) !== generic_an_plus_b_HYPHENMINUS) {
                    return 0;
                }

                return checkInteger(token, 3, DISALLOW_SIGN, offset);
        }
    }

    // '+'? n
    // '+'? n <signed-integer>
    // '+'? n ['+' | '-'] <signless-integer>
    // '+'? n- <signless-integer>
    // '+'? <ndashdigit-ident>
    else if (token.type === (/* inlined export .Ident */1) || (isDelim(token, generic_an_plus_b_PLUSSIGN) && getNextToken(offset + 1).type === (/* inlined export .Ident */1))) {
        // just ignore a plus
        if (token.type !== (/* inlined export .Ident */1)) {
            token = getNextToken(++offset);
        }

        if (token === null || !cmpChar(token.value, 0, generic_an_plus_b_N)) {
            return 0;
        }

        switch (token.value.length) {
            // '+'? n
            // '+'? n <signed-integer>
            // '+'? n ['+' | '-'] <signless-integer>
            case 1:
                return consumeB(getNextToken(++offset), offset, getNextToken);

            // '+'? n- <signless-integer>
            case 2:
                if (token.value.charCodeAt(1) !== generic_an_plus_b_HYPHENMINUS) {
                    return 0;
                }

                offset = skipSC(getNextToken(++offset), offset, getNextToken);
                token = getNextToken(offset);

                return checkInteger(token, 0, DISALLOW_SIGN, offset);

            // '+'? <ndashdigit-ident>
            default:
                if (token.value.charCodeAt(1) !== generic_an_plus_b_HYPHENMINUS) {
                    return 0;
                }

                return checkInteger(token, 2, DISALLOW_SIGN, offset);
        }
    }

    // <ndashdigit-dimension>
    // <ndash-dimension> <signless-integer>
    // <n-dimension>
    // <n-dimension> <signed-integer>
    // <n-dimension> ['+' | '-'] <signless-integer>
    else if (token.type === (/* inlined export .Dimension */12)) {
        let code = token.value.charCodeAt(0);
        let sign = code === generic_an_plus_b_PLUSSIGN || code === generic_an_plus_b_HYPHENMINUS ? 1 : 0;
        let i = sign;

        for (; i < token.value.length; i++) {
            if (!isDigit(token.value.charCodeAt(i))) {
                break;
            }
        }

        if (i === sign) {
            // Integer is expected
            return 0;
        }

        if (!cmpChar(token.value, i, generic_an_plus_b_N)) {
            return 0;
        }

        // <n-dimension>
        // <n-dimension> <signed-integer>
        // <n-dimension> ['+' | '-'] <signless-integer>
        if (i + 1 === token.value.length) {
            return consumeB(getNextToken(++offset), offset, getNextToken);
        } else {
            if (token.value.charCodeAt(i + 1) !== generic_an_plus_b_HYPHENMINUS) {
                return 0;
            }

            // <ndash-dimension> <signless-integer>
            if (i + 2 === token.value.length) {
                offset = skipSC(getNextToken(++offset), offset, getNextToken);
                token = getNextToken(offset);

                return checkInteger(token, 0, DISALLOW_SIGN, offset);
            }
            // <ndashdigit-dimension>
            else {
                return checkInteger(token, i + 2, DISALLOW_SIGN, offset);
            }
        }
    }

    return 0;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/generic-urange.js


const generic_urange_PLUSSIGN = 0x002B;     // U+002B PLUS SIGN (+)
const generic_urange_HYPHENMINUS = 0x002D;  // U+002D HYPHEN-MINUS (-)
const QUESTIONMARK = 0x003F; // U+003F QUESTION MARK (?)
const generic_urange_U = 0x0075;            // U+0075 LATIN SMALL LETTER U (u)

function generic_urange_isDelim(token, code) {
    return token !== null && token.type === (/* inlined export .Delim */9) && token.value.charCodeAt(0) === code;
}

function startsWith(token, code) {
    return token.value.charCodeAt(0) === code;
}

function hexSequence(token, offset, allowDash) {
    let hexlen = 0;

    for (let pos = offset; pos < token.value.length; pos++) {
        const code = token.value.charCodeAt(pos);

        if (code === generic_urange_HYPHENMINUS && allowDash && hexlen !== 0) {
            hexSequence(token, offset + hexlen + 1, false);
            return 6; // dissallow following question marks
        }

        if (!isHexDigit(code)) {
            return 0; // not a hex digit
        }

        if (++hexlen > 6) {
            return 0; // too many hex digits
        };
    }

    return hexlen;
}

function withQuestionMarkSequence(consumed, length, getNextToken) {
    if (!consumed) {
        return 0; // nothing consumed
    }

    while (generic_urange_isDelim(getNextToken(length), QUESTIONMARK)) {
        if (++consumed > 6) {
            return 0; // too many question marks
        }

        length++;
    }

    return length;
}

// https://drafts.csswg.org/css-syntax/#urange
// Informally, the <urange> production has three forms:
// U+0001
//      Defines a range consisting of a single code point, in this case the code point "1".
// U+0001-00ff
//      Defines a range of codepoints between the first and the second value, in this case
//      the range between "1" and "ff" (255 in decimal) inclusive.
// U+00??
//      Defines a range of codepoints where the "?" characters range over all hex digits,
//      in this case defining the same as the value U+0000-00ff.
// In each form, a maximum of 6 digits is allowed for each hexadecimal number (if you treat "?" as a hexadecimal digit).
//
// <urange> =
//   u '+' <ident-token> '?'* |
//   u <dimension-token> '?'* |
//   u <number-token> '?'* |
//   u <number-token> <dimension-token> |
//   u <number-token> <number-token> |
//   u '+' '?'+
function urange(token, getNextToken) {
    let length = 0;

    // should start with `u` or `U`
    if (token === null || token.type !== (/* inlined export .Ident */1) || !cmpChar(token.value, 0, generic_urange_U)) {
        return 0;
    }

    token = getNextToken(++length);
    if (token === null) {
        return 0;
    }

    // u '+' <ident-token> '?'*
    // u '+' '?'+
    if (generic_urange_isDelim(token, generic_urange_PLUSSIGN)) {
        token = getNextToken(++length);
        if (token === null) {
            return 0;
        }

        if (token.type === (/* inlined export .Ident */1)) {
            // u '+' <ident-token> '?'*
            return withQuestionMarkSequence(hexSequence(token, 0, true), ++length, getNextToken);
        }

        if (generic_urange_isDelim(token, QUESTIONMARK)) {
            // u '+' '?'+
            return withQuestionMarkSequence(1, ++length, getNextToken);
        }

        // Hex digit or question mark is expected
        return 0;
    }

    // u <number-token> '?'*
    // u <number-token> <dimension-token>
    // u <number-token> <number-token>
    if (token.type === (/* inlined export .Number */10)) {
        const consumedHexLength = hexSequence(token, 1, true);
        if (consumedHexLength === 0) {
            return 0;
        }

        token = getNextToken(++length);
        if (token === null) {
            // u <number-token> <eof>
            return length;
        }

        if (token.type === (/* inlined export .Dimension */12) || token.type === (/* inlined export .Number */10)) {
            // u <number-token> <dimension-token>
            // u <number-token> <number-token>
            if (!startsWith(token, generic_urange_HYPHENMINUS) || !hexSequence(token, 1, false)) {
                return 0;
            }

            return length + 1;
        }

        // u <number-token> '?'*
        return withQuestionMarkSequence(consumedHexLength, length, getNextToken);
    }

    // u <dimension-token> '?'*
    if (token.type === (/* inlined export .Dimension */12)) {
        return withQuestionMarkSequence(hexSequence(token, 1, true), ++length, getNextToken);
    }

    return 0;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/generic.js





// CSS mathematical functions categorized by return type behavior
// See: https://www.w3.org/TR/css-values-4/#math

// Calculation functions that return different types depending on input
const calcFunctionNames = [
    'calc(',
    '-moz-calc(',
    '-webkit-calc('
];

// Comparison functions that return different types depending on input
const comparisonFunctionNames = [
    'min(',
    'max(',
    'clamp('
];

// Functions that return a stepped value, i.e. a value that is rounded to the nearest step
const steppedValueFunctionNames = [
    'round(',
    'mod(',
    'rem('
];

// Trigonometrical functions that return a <number>
const trigNumberFunctionNames = [
    'sin(',
    'cos(',
    'tan('
];

// Trigonometrical functions that return a <angle>
const trigAngleFunctionNames = [
    'asin(',
    'acos(',
    'atan(',
    'atan2('
];

// Other functions that return a <number>
const otherNumberFunctionNames = [
    'pow(',
    'sqrt(',
    'log(',
    'exp(',
    'sign('
];

// Exponential functions that return a <number> or <dimension> or <percentage>
const expNumberDimensionPercentageFunctionNames = [
    'hypot('
];

// Return the same type as the input
const signFunctionNames = [
    'abs('
];

const numberFunctionNames = [
    ...calcFunctionNames,
    ...comparisonFunctionNames,
    ...steppedValueFunctionNames,
    ...trigNumberFunctionNames,
    ...otherNumberFunctionNames,
    ...expNumberDimensionPercentageFunctionNames,
    ...signFunctionNames
];

const percentageFunctionNames = [
    ...calcFunctionNames,
    ...comparisonFunctionNames,
    ...steppedValueFunctionNames,
    ...expNumberDimensionPercentageFunctionNames,
    ...signFunctionNames
];

const dimensionFunctionNames = [
    ...calcFunctionNames,
    ...comparisonFunctionNames,
    ...steppedValueFunctionNames,
    ...trigAngleFunctionNames,
    ...expNumberDimensionPercentageFunctionNames,
    ...signFunctionNames
];

const generic_balancePair = new Map([
    [(/* inlined export .Function */2), (/* inlined export .RightParenthesis */22)],
    [(/* inlined export .LeftParenthesis */21), (/* inlined export .RightParenthesis */22)],
    [(/* inlined export .LeftSquareBracket */19), (/* inlined export .RightSquareBracket */20)],
    [(/* inlined export .LeftCurlyBracket */23), (/* inlined export .RightCurlyBracket */24)]
]);

// safe char code getter
function charCodeAt(str, index) {
    return index < str.length ? str.charCodeAt(index) : 0;
}

function eqStr(actual, expected) {
    return cmpStr(actual, 0, actual.length, expected);
}

function eqStrAny(actual, expected) {
    for (let i = 0; i < expected.length; i++) {
        if (eqStr(actual, expected[i])) {
            return true;
        }
    }

    return false;
}

// IE postfix hack, i.e. 123\0 or 123px\9
function isPostfixIeHack(str, offset) {
    if (offset !== str.length - 2) {
        return false;
    }

    return (
        charCodeAt(str, offset) === 0x005C &&  // U+005C REVERSE SOLIDUS (\)
        isDigit(charCodeAt(str, offset + 1))
    );
}

function outOfRange(opts, value, numEnd) {
    if (opts && opts.type === 'Range') {
        const num = Number(
            numEnd !== undefined && numEnd !== value.length
                ? value.substr(0, numEnd)
                : value
        );

        if (isNaN(num)) {
            return true;
        }

        // FIXME: when opts.min is a string it's a dimension, skip a range validation
        // for now since it requires a type covertation which is not implmented yet
        if (opts.min !== null && num < opts.min && typeof opts.min !== 'string') {
            return true;
        }

        // FIXME: when opts.max is a string it's a dimension, skip a range validation
        // for now since it requires a type covertation which is not implmented yet
        if (opts.max !== null && num > opts.max && typeof opts.max !== 'string') {
            return true;
        }
    }

    return false;
}

function consumeFunction(token, getNextToken) {
    let balanceCloseType = 0;
    let balanceStash = [];
    let length = 0;

    // balanced token consuming
    scan:
    do {
        switch (token.type) {
            case (/* inlined export .RightCurlyBracket */24):
            case (/* inlined export .RightParenthesis */22):
            case (/* inlined export .RightSquareBracket */20):
                if (token.type !== balanceCloseType) {
                    break scan;
                }

                balanceCloseType = balanceStash.pop();

                if (balanceStash.length === 0) {
                    length++;
                    break scan;
                }

                break;

            case (/* inlined export .Function */2):
            case (/* inlined export .LeftParenthesis */21):
            case (/* inlined export .LeftSquareBracket */19):
            case (/* inlined export .LeftCurlyBracket */23):
                balanceStash.push(balanceCloseType);
                balanceCloseType = generic_balancePair.get(token.type);
                break;
        }

        length++;
    } while (token = getNextToken(length));

    return length;
}


// TODO: implement
// can be used wherever <length>, <frequency>, <angle>, <time>, <percentage>, <number>, or <integer> values are allowed
// https://drafts.csswg.org/css-values/#calc-notation
function math(next, functionNames) {
    return function(token, getNextToken, opts) {
        if (token === null) {
            return 0;
        }

        if (token.type === (/* inlined export .Function */2) && eqStrAny(token.value, functionNames)) {
            return consumeFunction(token, getNextToken);
        }

        return next(token, getNextToken, opts);
    };
}

function generic_tokenType(expectedTokenType) {
    return function(token) {
        if (token === null || token.type !== expectedTokenType) {
            return 0;
        }

        return 1;
    };
}

// =========================
// Complex types
//

// https://drafts.csswg.org/css-values-4/#custom-idents
// 4.2. Author-defined Identifiers: the <custom-ident> type
// Some properties accept arbitrary author-defined identifiers as a component value.
// This generic data type is denoted by <custom-ident>, and represents any valid CSS identifier
// that would not be misinterpreted as a pre-defined keyword in that property’s value definition.
//
// See also: https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
function customIdent(token) {
    if (token === null || token.type !== (/* inlined export .Ident */1)) {
        return 0;
    }

    const name = token.value.toLowerCase();

    // The CSS-wide keywords are not valid <custom-ident>s
    if (eqStrAny(name, cssWideKeywords)) {
        return 0;
    }

    // The default keyword is reserved and is also not a valid <custom-ident>
    if (eqStr(name, 'default')) {
        return 0;
    }

    // TODO: ignore property specific keywords (as described https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident)
    // Specifications using <custom-ident> must specify clearly what other keywords
    // are excluded from <custom-ident>, if any—for example by saying that any pre-defined keywords
    // in that property’s value definition are excluded. Excluded keywords are excluded
    // in all ASCII case permutations.

    return 1;
}

// https://drafts.csswg.org/css-values-4/#dashed-idents
// The <dashed-ident> production is a <custom-ident>, with all the case-sensitivity that implies,
// with the additional restriction that it must start with two dashes (U+002D HYPHEN-MINUS).
function dashedIdent(token) {
    if (token === null || token.type !== (/* inlined export .Ident */1)) {
        return 0;
    }

    // ... must start with two dashes (U+002D HYPHEN-MINUS)
    if (charCodeAt(token.value, 0) !== 0x002D || charCodeAt(token.value, 1) !== 0x002D) {
        return 0;
    }

    return 1;
}

// https://drafts.csswg.org/css-variables/#typedef-custom-property-name
// A custom property is any property whose name starts with two dashes (U+002D HYPHEN-MINUS), like --foo.
// The <custom-property-name> production corresponds to this: it’s defined as any <dashed-ident>
// (a valid identifier that starts with two dashes), except -- itself, which is reserved for future use by CSS.
function customPropertyName(token) {
    // ... it’s defined as any <dashed-ident>
    if (!dashedIdent(token)) {
        return 0;
    }

    // ... except -- itself, which is reserved for future use by CSS
    if (token.value === '--') {
        return 0;
    }

    return 1;
}

// https://drafts.csswg.org/css-color-4/#hex-notation
// The syntax of a <hex-color> is a <hash-token> token whose value consists of 3, 4, 6, or 8 hexadecimal digits.
// In other words, a hex color is written as a hash character, "#", followed by some number of digits 0-9 or
// letters a-f (the case of the letters doesn’t matter - #00ff00 is identical to #00FF00).
function hexColor(token) {
    if (token === null || token.type !== (/* inlined export .Hash */4)) {
        return 0;
    }

    const length = token.value.length;

    // valid values (length): #rgb (4), #rgba (5), #rrggbb (7), #rrggbbaa (9)
    if (length !== 4 && length !== 5 && length !== 7 && length !== 9) {
        return 0;
    }

    for (let i = 1; i < length; i++) {
        if (!isHexDigit(charCodeAt(token.value, i))) {
            return 0;
        }
    }

    return 1;
}

function idSelector(token) {
    if (token === null || token.type !== (/* inlined export .Hash */4)) {
        return 0;
    }

    if (!isIdentifierStart(charCodeAt(token.value, 1), charCodeAt(token.value, 2), charCodeAt(token.value, 3))) {
        return 0;
    }

    return 1;
}

// https://drafts.csswg.org/css-syntax/#any-value
// It represents the entirety of what a valid declaration can have as its value.
function declarationValue(token, getNextToken) {
    if (!token) {
        return 0;
    }

    let balanceCloseType = 0;
    let balanceStash = [];
    let length = 0;

    // The <declaration-value> production matches any sequence of one or more tokens,
    // so long as the sequence does not contain ...
    scan:
    do {
        switch (token.type) {
            // ... <bad-string-token>, <bad-url-token>,
            case (/* inlined export .BadString */6):
            case (/* inlined export .BadUrl */8):
                break scan;

            // ... unmatched <)-token>, <]-token>, or <}-token>,
            case (/* inlined export .RightCurlyBracket */24):
            case (/* inlined export .RightParenthesis */22):
            case (/* inlined export .RightSquareBracket */20):
                if (token.type !== balanceCloseType) {
                    break scan;
                }

                balanceCloseType = balanceStash.pop();
                break;

            // ... or top-level <semicolon-token> tokens
            case (/* inlined export .Semicolon */17):
                if (balanceCloseType === 0) {
                    break scan;
                }

                break;

            // ... or <delim-token> tokens with a value of "!"
            case (/* inlined export .Delim */9):
                if (balanceCloseType === 0 && token.value === '!') {
                    break scan;
                }

                break;

            case (/* inlined export .Function */2):
            case (/* inlined export .LeftParenthesis */21):
            case (/* inlined export .LeftSquareBracket */19):
            case (/* inlined export .LeftCurlyBracket */23):
                balanceStash.push(balanceCloseType);
                balanceCloseType = generic_balancePair.get(token.type);
                break;
        }

        length++;
    } while (token = getNextToken(length));

    return length;
}

// https://drafts.csswg.org/css-syntax/#any-value
// The <any-value> production is identical to <declaration-value>, but also
// allows top-level <semicolon-token> tokens and <delim-token> tokens
// with a value of "!". It represents the entirety of what valid CSS can be in any context.
function anyValue(token, getNextToken) {
    if (!token) {
        return 0;
    }

    let balanceCloseType = 0;
    let balanceStash = [];
    let length = 0;

    // The <any-value> production matches any sequence of one or more tokens,
    // so long as the sequence ...
    scan:
    do {
        switch (token.type) {
            // ... does not contain <bad-string-token>, <bad-url-token>,
            case (/* inlined export .BadString */6):
            case (/* inlined export .BadUrl */8):
                break scan;

            // ... unmatched <)-token>, <]-token>, or <}-token>,
            case (/* inlined export .RightCurlyBracket */24):
            case (/* inlined export .RightParenthesis */22):
            case (/* inlined export .RightSquareBracket */20):
                if (token.type !== balanceCloseType) {
                    break scan;
                }

                balanceCloseType = balanceStash.pop();
                break;

            case (/* inlined export .Function */2):
            case (/* inlined export .LeftParenthesis */21):
            case (/* inlined export .LeftSquareBracket */19):
            case (/* inlined export .LeftCurlyBracket */23):
                balanceStash.push(balanceCloseType);
                balanceCloseType = generic_balancePair.get(token.type);
                break;
        }

        length++;
    } while (token = getNextToken(length));

    return length;
}

// =========================
// Dimensions
//

function dimension(type) {
    if (type) {
        type = new Set(type);
    }

    return function(token, getNextToken, opts) {
        if (token === null || token.type !== (/* inlined export .Dimension */12)) {
            return 0;
        }

        const numberEnd = consumeNumber(token.value, 0);

        // check unit
        if (type !== null) {
            // check for IE postfix hack, i.e. 123px\0 or 123px\9
            const reverseSolidusOffset = token.value.indexOf('\\', numberEnd);
            const unit = reverseSolidusOffset === -1 || !isPostfixIeHack(token.value, reverseSolidusOffset)
                ? token.value.substr(numberEnd)
                : token.value.substring(numberEnd, reverseSolidusOffset);

            if (type.has(unit.toLowerCase()) === false) {
                return 0;
            }
        }

        // check range if specified
        if (outOfRange(opts, token.value, numberEnd)) {
            return 0;
        }

        return 1;
    };
}

// =========================
// Percentage
//

// §5.5. Percentages: the <percentage> type
// https://drafts.csswg.org/css-values-4/#percentages
function percentage(token, getNextToken, opts) {
    // ... corresponds to the <percentage-token> production
    if (token === null || token.type !== (/* inlined export .Percentage */11)) {
        return 0;
    }

    // check range if specified
    if (outOfRange(opts, token.value, token.value.length - 1)) {
        return 0;
    }

    return 1;
}

// =========================
// Numeric
//

// https://drafts.csswg.org/css-values-4/#numbers
// The value <zero> represents a literal number with the value 0. Expressions that merely
// evaluate to a <number> with the value 0 (for example, calc(0)) do not match <zero>;
// only literal <number-token>s do.
function zero(next) {
    if (typeof next !== 'function') {
        next = function() {
            return 0;
        };
    }

    return function(token, getNextToken, opts) {
        if (token !== null && token.type === (/* inlined export .Number */10)) {
            if (Number(token.value) === 0) {
                return 1;
            }
        }

        return next(token, getNextToken, opts);
    };
}

// § 5.3. Real Numbers: the <number> type
// https://drafts.csswg.org/css-values-4/#numbers
// Number values are denoted by <number>, and represent real numbers, possibly with a fractional component.
// ... It corresponds to the <number-token> production
function generic_number(token, getNextToken, opts) {
    if (token === null) {
        return 0;
    }

    const numberEnd = consumeNumber(token.value, 0);
    const isNumber = numberEnd === token.value.length;
    if (!isNumber && !isPostfixIeHack(token.value, numberEnd)) {
        return 0;
    }

    // check range if specified
    if (outOfRange(opts, token.value, numberEnd)) {
        return 0;
    }

    return 1;
}

// §5.2. Integers: the <integer> type
// https://drafts.csswg.org/css-values-4/#integers
function integer(token, getNextToken, opts) {
    // ... corresponds to a subset of the <number-token> production
    if (token === null || token.type !== (/* inlined export .Number */10)) {
        return 0;
    }

    // The first digit of an integer may be immediately preceded by `-` or `+` to indicate the integer’s sign.
    let i = charCodeAt(token.value, 0) === 0x002B ||       // U+002B PLUS SIGN (+)
            charCodeAt(token.value, 0) === 0x002D ? 1 : 0; // U+002D HYPHEN-MINUS (-)

    // When written literally, an integer is one or more decimal digits 0 through 9 ...
    for (; i < token.value.length; i++) {
        if (!isDigit(charCodeAt(token.value, i))) {
            return 0;
        }
    }

    // check range if specified
    if (outOfRange(opts, token.value, i)) {
        return 0;
    }

    return 1;
}

// token types
const tokenTypes = {
    'ident-token': generic_tokenType((/* inlined export .Ident */1)),
    'function-token': generic_tokenType((/* inlined export .Function */2)),
    'at-keyword-token': generic_tokenType((/* inlined export .AtKeyword */3)),
    'hash-token': generic_tokenType((/* inlined export .Hash */4)),
    'string-token': generic_tokenType((/* inlined export .String */5)),
    'bad-string-token': generic_tokenType((/* inlined export .BadString */6)),
    'url-token': generic_tokenType((/* inlined export .Url */7)),
    'bad-url-token': generic_tokenType((/* inlined export .BadUrl */8)),
    'delim-token': generic_tokenType((/* inlined export .Delim */9)),
    'number-token': generic_tokenType((/* inlined export .Number */10)),
    'percentage-token': generic_tokenType((/* inlined export .Percentage */11)),
    'dimension-token': generic_tokenType((/* inlined export .Dimension */12)),
    'whitespace-token': generic_tokenType((/* inlined export .WhiteSpace */13)),
    'CDO-token': generic_tokenType((/* inlined export .CDO */14)),
    'CDC-token': generic_tokenType((/* inlined export .CDC */15)),
    'colon-token': generic_tokenType((/* inlined export .Colon */16)),
    'semicolon-token': generic_tokenType((/* inlined export .Semicolon */17)),
    'comma-token': generic_tokenType((/* inlined export .Comma */18)),
    '[-token': generic_tokenType((/* inlined export .LeftSquareBracket */19)),
    ']-token': generic_tokenType((/* inlined export .RightSquareBracket */20)),
    '(-token': generic_tokenType((/* inlined export .LeftParenthesis */21)),
    ')-token': generic_tokenType((/* inlined export .RightParenthesis */22)),
    '{-token': generic_tokenType((/* inlined export .LeftCurlyBracket */23)),
    '}-token': generic_tokenType((/* inlined export .RightCurlyBracket */24))
};

// token production types
const productionTypes = {
    // token type aliases
    'string': generic_tokenType((/* inlined export .String */5)),
    'ident': generic_tokenType((/* inlined export .Ident */1)),

    // percentage
    'percentage': math(percentage, percentageFunctionNames),

    // numeric
    'zero': zero(),
    'number': math(generic_number, numberFunctionNames),
    'integer': math(integer, numberFunctionNames),

    // complex types
    'custom-ident': customIdent,
    'dashed-ident': dashedIdent,
    'custom-property-name': customPropertyName,
    'hex-color': hexColor,
    'id-selector': idSelector, // element( <id-selector> )
    'an-plus-b': anPlusB,
    'urange': urange,
    'declaration-value': declarationValue,
    'any-value': anyValue
};

const unitGroups = [
    'length',
    'angle',
    'time',
    'frequency',
    'resolution',
    'flex',
    'decibel',
    'semitones'
];

// dimensions types depend on units set
function createDemensionTypes(units) {
    const {
        angle,
        decibel,
        frequency,
        flex,
        length,
        resolution,
        semitones,
        time
    } = units || {};

    return {
        'dimension': math(dimension(null), dimensionFunctionNames),
        'angle': math(dimension(angle), dimensionFunctionNames),
        'decibel': math(dimension(decibel), dimensionFunctionNames),
        'frequency': math(dimension(frequency), dimensionFunctionNames),
        'flex': math(dimension(flex), dimensionFunctionNames),
        'length': math(zero(dimension(length)), dimensionFunctionNames),
        'resolution': math(dimension(resolution), dimensionFunctionNames),
        'semitones': math(dimension(semitones), dimensionFunctionNames),
        'time': math(dimension(time), dimensionFunctionNames)
    };
}

// The <attr-unit> production matches any identifier that is an ASCII case-insensitive
// match for the name of a CSS dimension unit, such as px, or the <delim-token> %.
function createAttrUnit(units) {
    const unitSet = new Set();

    for (const group of unitGroups) {
        if (Array.isArray(units[group])) {
            for (const unit of units[group]) {
                unitSet.add(unit.toLowerCase());
            }
        }
    }

    return function attrUnit(token) {
        if (token === null) {
            return 0;
        }

        if (token.type === (/* inlined export .Delim */9) && token.value === '%') {
            return 1;
        }

        if (token.type === (/* inlined export .Ident */1) && unitSet.has(token.value.toLowerCase())) {
            return 1;
        }

        return 0;
    };
}

function createGenericTypes(units) {
    return {
        ...tokenTypes,
        ...productionTypes,
        ...createDemensionTypes(units),
        'attr-unit': createAttrUnit(units)
    };
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/units.js
const units_length = [
    // absolute length units https://www.w3.org/TR/css-values-3/#lengths
    'cm', 'mm', 'q', 'in', 'pt', 'pc', 'px',
    // font-relative length units https://drafts.csswg.org/css-values-4/#font-relative-lengths
    'em', 'rem',
    'ex', 'rex',
    'cap', 'rcap',
    'ch', 'rch',
    'ic', 'ric',
    'lh', 'rlh',
    // viewport-percentage lengths https://drafts.csswg.org/css-values-4/#viewport-relative-lengths
    'vw', 'svw', 'lvw', 'dvw',
    'vh', 'svh', 'lvh', 'dvh',
    'vi', 'svi', 'lvi', 'dvi',
    'vb', 'svb', 'lvb', 'dvb',
    'vmin', 'svmin', 'lvmin', 'dvmin',
    'vmax', 'svmax', 'lvmax', 'dvmax',
    // container relative lengths https://drafts.csswg.org/css-contain-3/#container-lengths
    'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax'
];
const units_angle = ['deg', 'grad', 'rad', 'turn'];    // https://www.w3.org/TR/css-values-3/#angles
const units_time = ['s', 'ms'];                        // https://www.w3.org/TR/css-values-3/#time
const units_frequency = ['hz', 'khz'];                 // https://www.w3.org/TR/css-values-3/#frequency
const units_resolution = ['dpi', 'dpcm', 'dppx', 'x']; // https://www.w3.org/TR/css-values-3/#resolution
const units_flex = ['fr'];                             // https://drafts.csswg.org/css-grid/#fr-unit
const units_decibel = ['db'];                          // https://www.w3.org/TR/css3-speech/#mixing-props-voice-volume
const units_semitones = ['st'];                        // https://www.w3.org/TR/css3-speech/#voice-props-voice-pitch

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/definition-syntax/SyntaxError.js


function definition_syntax_SyntaxError_SyntaxError(message, input, offset) {
    return Object.assign(createCustomError('SyntaxError', message), {
        input,
        offset,
        rawMessage: message,
        message: message + '\n' +
            '  ' + input + '\n' +
            '--' + new Array((offset || input.length) + 1).join('-') + '^'
    });
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/definition-syntax/scanner.js


const TAB = 9;
const scanner_N = 10;
const scanner_F = 12;
const scanner_R = 13;
const SPACE = 32;
const NAME_CHAR = new Uint8Array(128).map((_, idx) =>
    /[a-zA-Z0-9\-]/.test(String.fromCharCode(idx)) ? 1 : 0
);

class Scanner {
    constructor(str) {
        this.str = str;
        this.pos = 0;
    }

    charCodeAt(pos) {
        return pos < this.str.length ? this.str.charCodeAt(pos) : 0;
    }
    charCode() {
        return this.charCodeAt(this.pos);
    }
    isNameCharCode(code = this.charCode()) {
        return code < 128 && NAME_CHAR[code] === 1;
    }
    nextCharCode() {
        return this.charCodeAt(this.pos + 1);
    }
    nextNonWsCode(pos) {
        return this.charCodeAt(this.findWsEnd(pos));
    }
    skipWs() {
        this.pos = this.findWsEnd(this.pos);
    }
    findWsEnd(pos) {
        for (; pos < this.str.length; pos++) {
            const code = this.str.charCodeAt(pos);
            if (code !== scanner_R && code !== scanner_N && code !== scanner_F && code !== SPACE && code !== TAB) {
                break;
            }
        }

        return pos;
    }
    substringToPos(end) {
        return this.str.substring(this.pos, this.pos = end);
    }
    eat(code) {
        if (this.charCode() !== code) {
            this.error('Expect `' + String.fromCharCode(code) + '`');
        }

        this.pos++;
    }
    peek() {
        return this.pos < this.str.length ? this.str.charAt(this.pos++) : '';
    }
    error(message) {
        throw new definition_syntax_SyntaxError_SyntaxError(message, this.str, this.pos);
    }

    scanSpaces() {
        return this.substringToPos(this.findWsEnd(this.pos));
    }
    scanWord() {
        let end = this.pos;

        for (; end < this.str.length; end++) {
            const code = this.str.charCodeAt(end);
            if (code >= 128 || NAME_CHAR[code] === 0) {
                break;
            }
        }

        if (this.pos === end) {
            this.error('Expect a keyword');
        }

        return this.substringToPos(end);
    }
    scanNumber() {
        let end = this.pos;

        for (; end < this.str.length; end++) {
            const code = this.str.charCodeAt(end);

            if (code < 48 || code > 57) {
                break;
            }
        }

        if (this.pos === end) {
            this.error('Expect a number');
        }

        return this.substringToPos(end);
    }
    scanString() {
        const end = this.str.indexOf('\'', this.pos + 1);

        if (end === -1) {
            this.pos = this.str.length;
            this.error('Expect an apostrophe');
        }

        return this.substringToPos(end + 1);
    }
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/definition-syntax/parse.js


const parse_TAB = 9;
const parse_N = 10;
const parse_F = 12;
const parse_R = 13;
const parse_SPACE = 32;
const parse_EXCLAMATIONMARK = 33;    // !
const parse_NUMBERSIGN = 35;         // #
const AMPERSAND = 38;          // &
const APOSTROPHE = 39;         // '
const LEFTPARENTHESIS = 40;    // (
const RIGHTPARENTHESIS = 41;   // )
const ASTERISK = 42;           // *
const parse_PLUSSIGN = 43;           // +
const COMMA = 44;              // ,
const HYPERMINUS = 45;         // -
const LESSTHANSIGN = 60;       // <
const GREATERTHANSIGN = 62;    // >
const parse_QUESTIONMARK = 63;       // ?
const COMMERCIALAT = 64;       // @
const LEFTSQUAREBRACKET = 91;  // [
const RIGHTSQUAREBRACKET = 93; // ]
const parse_LEFTCURLYBRACKET = 123;  // {
const VERTICALLINE = 124;      // |
const RIGHTCURLYBRACKET = 125; // }
const INFINITY = 8734;         // ∞
const COMBINATOR_PRECEDENCE = {
    ' ': 1,
    '&&': 2,
    '||': 3,
    '|': 4
};

function readMultiplierRange(scanner) {
    let min = null;
    let max = null;

    scanner.eat(parse_LEFTCURLYBRACKET);
    scanner.skipWs();

    min = scanner.scanNumber(scanner);
    scanner.skipWs();

    if (scanner.charCode() === COMMA) {
        scanner.pos++;
        scanner.skipWs();

        if (scanner.charCode() !== RIGHTCURLYBRACKET) {
            max = scanner.scanNumber(scanner);
            scanner.skipWs();
        }
    } else {
        max = min;
    }

    scanner.eat(RIGHTCURLYBRACKET);

    return {
        min: Number(min),
        max: max ? Number(max) : 0
    };
}

function readMultiplier(scanner) {
    let range = null;
    let comma = false;

    switch (scanner.charCode()) {
        case ASTERISK:
            scanner.pos++;

            range = {
                min: 0,
                max: 0
            };

            break;

        case parse_PLUSSIGN:
            scanner.pos++;

            range = {
                min: 1,
                max: 0
            };

            break;

        case parse_QUESTIONMARK:
            scanner.pos++;

            range = {
                min: 0,
                max: 1
            };

            break;

        case parse_NUMBERSIGN:
            scanner.pos++;

            comma = true;

            if (scanner.charCode() === parse_LEFTCURLYBRACKET) {
                range = readMultiplierRange(scanner);
            } else if (scanner.charCode() === parse_QUESTIONMARK) {
                // https://www.w3.org/TR/css-values-4/#component-multipliers
                // > the # and ? multipliers may be stacked as #?
                // In this case just treat "#?" as a single multiplier
                // { min: 0, max: 0, comma: true }
                scanner.pos++;
                range = {
                    min: 0,
                    max: 0
                };
            } else {
                range = {
                    min: 1,
                    max: 0
                };
            }

            break;

        case parse_LEFTCURLYBRACKET:
            range = readMultiplierRange(scanner);
            break;

        default:
            return null;
    }

    return {
        type: 'Multiplier',
        comma,
        min: range.min,
        max: range.max,
        term: null
    };
}

function maybeMultiplied(scanner, node) {
    const multiplier = readMultiplier(scanner);

    if (multiplier !== null) {
        multiplier.term = node;

        // https://www.w3.org/TR/css-values-4/#component-multipliers
        // > The + and # multipliers may be stacked as +#;
        // Represent "+#" as nested multipliers:
        // { ...<multiplier #>,
        //   term: {
        //     ...<multipler +>,
        //     term: node
        //   }
        // }
        if (scanner.charCode() === parse_NUMBERSIGN &&
            scanner.charCodeAt(scanner.pos - 1) === parse_PLUSSIGN) {
            return maybeMultiplied(scanner, multiplier);
        }

        // https://www.w3.org/TR/css-values-4/#component-multipliers
        // > the # and ? multipliers, {A} and ? multipliers, and {A,B} and ? multipliers
        // > may be stacked as #?, {A}?, and {A,B}?, respectively
        // Represent "{}?" as nested multipliers as well as "+#".
        // The "#?" case is already handled above, in maybeMultiplied()
        if (scanner.charCode() === parse_QUESTIONMARK &&
            scanner.charCodeAt(scanner.pos - 1) === RIGHTCURLYBRACKET) {
            return maybeMultiplied(scanner, multiplier);
        }

        return multiplier;
    }

    return node;
}

function maybeToken(scanner) {
    const ch = scanner.peek();

    if (ch === '') {
        return null;
    }

    return maybeMultiplied(scanner, {
        type: 'Token',
        value: ch
    });
}

function readProperty(scanner) {
    let name;

    scanner.eat(LESSTHANSIGN);
    scanner.eat(APOSTROPHE);

    name = scanner.scanWord();

    scanner.eat(APOSTROPHE);
    scanner.eat(GREATERTHANSIGN);

    return maybeMultiplied(scanner, {
        type: 'Property',
        name
    });
}

// https://drafts.csswg.org/css-values-3/#numeric-ranges
// 4.1. Range Restrictions and Range Definition Notation
//
// Range restrictions can be annotated in the numeric type notation using CSS bracketed
// range notation—[min,max]—within the angle brackets, after the identifying keyword,
// indicating a closed range between (and including) min and max.
// For example, <integer [0, 10]> indicates an integer between 0 and 10, inclusive.
function readTypeRange(scanner) {
    // use null for Infinity to make AST format JSON serializable/deserializable
    let min = null; // -Infinity
    let max = null; // Infinity
    let sign = 1;

    scanner.eat(LEFTSQUAREBRACKET);

    if (scanner.charCode() === HYPERMINUS) {
        scanner.peek();
        sign = -1;
    }

    if (sign == -1 && scanner.charCode() === INFINITY) {
        scanner.peek();
    } else {
        min = sign * Number(scanner.scanNumber(scanner));

        if (scanner.isNameCharCode()) {
            min += scanner.scanWord();
        }
    }

    scanner.skipWs();
    scanner.eat(COMMA);
    scanner.skipWs();

    if (scanner.charCode() === INFINITY) {
        scanner.peek();
    } else {
        sign = 1;

        if (scanner.charCode() === HYPERMINUS) {
            scanner.peek();
            sign = -1;
        }

        max = sign * Number(scanner.scanNumber(scanner));

        if (scanner.isNameCharCode()) {
            max += scanner.scanWord();
        }
    }

    scanner.eat(RIGHTSQUAREBRACKET);

    return {
        type: 'Range',
        min,
        max
    };
}

function readType(scanner) {
    let name;
    let opts = null;

    scanner.eat(LESSTHANSIGN);
    name = scanner.scanWord();

    // https://drafts.csswg.org/css-values-5/#boolean
    if (name === 'boolean-expr') {
        scanner.eat(LEFTSQUAREBRACKET);

        const implicitGroup = readImplicitGroup(scanner, RIGHTSQUAREBRACKET);

        scanner.eat(RIGHTSQUAREBRACKET);
        scanner.eat(GREATERTHANSIGN);

        return maybeMultiplied(scanner, {
            type: 'Boolean',
            term: implicitGroup.terms.length === 1
                ? implicitGroup.terms[0]
                : implicitGroup
        });
    }

    if (scanner.charCode() === LEFTPARENTHESIS &&
        scanner.nextCharCode() === RIGHTPARENTHESIS) {
        scanner.pos += 2;
        name += '()';
    }

    if (scanner.charCodeAt(scanner.findWsEnd(scanner.pos)) === LEFTSQUAREBRACKET) {
        scanner.skipWs();
        opts = readTypeRange(scanner);
    }

    scanner.eat(GREATERTHANSIGN);

    return maybeMultiplied(scanner, {
        type: 'Type',
        name,
        opts
    });
}

function readKeywordOrFunction(scanner) {
    const name = scanner.scanWord();

    if (scanner.charCode() === LEFTPARENTHESIS) {
        scanner.pos++;

        return {
            type: 'Function',
            name
        };
    }

    return maybeMultiplied(scanner, {
        type: 'Keyword',
        name
    });
}

function regroupTerms(terms, combinators) {
    function createGroup(terms, combinator) {
        return {
            type: 'Group',
            terms,
            combinator,
            disallowEmpty: false,
            explicit: false
        };
    }

    let combinator;

    combinators = Object.keys(combinators)
        .sort((a, b) => COMBINATOR_PRECEDENCE[a] - COMBINATOR_PRECEDENCE[b]);

    while (combinators.length > 0) {
        combinator = combinators.shift();

        let i = 0;
        let subgroupStart = 0;

        for (; i < terms.length; i++) {
            const term = terms[i];

            if (term.type === 'Combinator') {
                if (term.value === combinator) {
                    if (subgroupStart === -1) {
                        subgroupStart = i - 1;
                    }
                    terms.splice(i, 1);
                    i--;
                } else {
                    if (subgroupStart !== -1 && i - subgroupStart > 1) {
                        terms.splice(
                            subgroupStart,
                            i - subgroupStart,
                            createGroup(terms.slice(subgroupStart, i), combinator)
                        );
                        i = subgroupStart + 1;
                    }
                    subgroupStart = -1;
                }
            }
        }

        if (subgroupStart !== -1 && combinators.length) {
            terms.splice(
                subgroupStart,
                i - subgroupStart,
                createGroup(terms.slice(subgroupStart, i), combinator)
            );
        }
    }

    return combinator;
}

function readImplicitGroup(scanner, stopCharCode = -1) {
    const combinators = Object.create(null);
    const terms = [];
    let prevToken = null;
    let prevTokenPos = scanner.pos;
    let prevTokenIsFunction = false;

    while (scanner.charCode() !== stopCharCode) {
        let token = prevTokenIsFunction
            ? readImplicitGroup(scanner, RIGHTPARENTHESIS)
            : peek(scanner);

        if (!token) {
            break;
        }

        if (token.type === 'Spaces') {
            continue;
        }

        if (prevTokenIsFunction) {
            if (token.terms.length === 0) {
                prevTokenIsFunction = false;
                continue;
            }

            if (token.combinator === ' ') {
                while (token.terms.length > 1) {
                    combinators[' '] = true;  // a b
                    terms.push({
                        type: 'Combinator',
                        value: ' '
                    }, token.terms.shift());
                }

                token = token.terms[0];
            }
        }

        if (token.type === 'Combinator') {
            // check for combinator in group beginning and double combinator sequence
            if (prevToken === null || prevToken.type === 'Combinator') {
                scanner.pos = prevTokenPos;
                scanner.error('Unexpected combinator');
            }

            combinators[token.value] = true;
        } else if (prevToken !== null && prevToken.type !== 'Combinator') {
            combinators[' '] = true;  // a b
            terms.push({
                type: 'Combinator',
                value: ' '
            });
        }

        terms.push(token);
        prevToken = token;
        prevTokenPos = scanner.pos;
        prevTokenIsFunction = token.type === 'Function';
    }

    // check for combinator in group ending
    if (prevToken !== null && prevToken.type === 'Combinator') {
        scanner.pos -= prevTokenPos;
        scanner.error('Unexpected combinator');
    }

    return {
        type: 'Group',
        terms,
        combinator: regroupTerms(terms, combinators) || ' ',
        disallowEmpty: false,
        explicit: false
    };
}

function readGroup(scanner) {
    let result;

    scanner.eat(LEFTSQUAREBRACKET);
    result = readImplicitGroup(scanner, RIGHTSQUAREBRACKET);
    scanner.eat(RIGHTSQUAREBRACKET);

    result.explicit = true;

    if (scanner.charCode() === parse_EXCLAMATIONMARK) {
        scanner.pos++;
        result.disallowEmpty = true;
    }

    return result;
}

function peek(scanner) {
    let code = scanner.charCode();

    switch (code) {
        case RIGHTSQUAREBRACKET:
            // don't eat, stop scan a group
            break;

        case LEFTSQUAREBRACKET:
            return maybeMultiplied(scanner, readGroup(scanner));

        case LESSTHANSIGN:
            return scanner.nextCharCode() === APOSTROPHE
                ? readProperty(scanner)
                : readType(scanner);

        case VERTICALLINE:
            return {
                type: 'Combinator',
                value: scanner.substringToPos(
                    scanner.pos + (scanner.nextCharCode() === VERTICALLINE ? 2 : 1)
                )
            };

        case AMPERSAND:
            scanner.pos++;
            scanner.eat(AMPERSAND);

            return {
                type: 'Combinator',
                value: '&&'
            };

        case COMMA:
            scanner.pos++;
            return {
                type: 'Comma'
            };

        case APOSTROPHE:
            return maybeMultiplied(scanner, {
                type: 'String',
                value: scanner.scanString()
            });

        case parse_SPACE:
        case parse_TAB:
        case parse_N:
        case parse_R:
        case parse_F:
            return {
                type: 'Spaces',
                value: scanner.scanSpaces()
            };

        case COMMERCIALAT:
            code = scanner.nextCharCode();

            if (scanner.isNameCharCode(code)) {
                scanner.pos++;
                return {
                    type: 'AtKeyword',
                    name: scanner.scanWord()
                };
            }

            return maybeToken(scanner);

        case ASTERISK:
        case parse_PLUSSIGN:
        case parse_QUESTIONMARK:
        case parse_NUMBERSIGN:
        case parse_EXCLAMATIONMARK:
            // prohibited tokens (used as a multiplier start)
            break;

        case parse_LEFTCURLYBRACKET:
            // LEFTCURLYBRACKET is allowed since mdn/data uses it w/o quoting
            // check next char isn't a number, because it's likely a disjoined multiplier
            code = scanner.nextCharCode();

            if (code < 48 || code > 57) {
                return maybeToken(scanner);
            }

            break;

        default:
            if (scanner.isNameCharCode(code)) {
                return readKeywordOrFunction(scanner);
            }

            return maybeToken(scanner);
    }
}

function parse_parse(source) {
    const scanner = new Scanner(source);
    const result = readImplicitGroup(scanner);

    if (scanner.pos !== source.length) {
        scanner.error('Unexpected input');
    }

    // reduce redundant groups with single group term
    if (result.terms.length === 1 && result.terms[0].type === 'Group') {
        return result.terms[0];
    }

    return result;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/definition-syntax/walk.js
const walk_noop = function() {};

function walk_ensureFunction(value) {
    return typeof value === 'function' ? value : walk_noop;
}

function walk_walk(node, options, context) {
    function walk(node) {
        enter.call(context, node);

        switch (node.type) {
            case 'Group':
                node.terms.forEach(walk);
                break;

            case 'Multiplier':
            case 'Boolean':
                walk(node.term);
                break;

            case 'Type':
            case 'Property':
            case 'Keyword':
            case 'AtKeyword':
            case 'Function':
            case 'String':
            case 'Token':
            case 'Comma':
                break;

            default:
                throw new Error('Unknown type: ' + node.type);
        }

        leave.call(context, node);
    }

    let enter = walk_noop;
    let leave = walk_noop;

    if (typeof options === 'function') {
        enter = options;
    } else if (options) {
        enter = walk_ensureFunction(options.enter);
        leave = walk_ensureFunction(options.leave);
    }

    if (enter === walk_noop && leave === walk_noop) {
        throw new Error('Neither `enter` nor `leave` walker handler is set or both aren\'t a function');
    }

    walk(node, context);
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/prepare-tokens.js


const astToTokens = {
    decorator(handlers) {
        const tokens = [];
        let curNode = null;

        return {
            ...handlers,
            node(node) {
                const tmp = curNode;
                curNode = node;
                handlers.node.call(this, node);
                curNode = tmp;
            },
            emit(value, type, auto) {
                tokens.push({
                    type,
                    value,
                    node: auto ? null : curNode
                });
            },
            result() {
                return tokens;
            }
        };
    }
};

function stringToTokens(str) {
    const tokens = [];

    tokenizer_tokenize(str, (type, start, end) =>
        tokens.push({
            type,
            value: str.slice(start, end),
            node: null
        })
    );

    return tokens;
}

/* export default */ function prepare_tokens(value, syntax) {
    if (typeof value === 'string') {
        return stringToTokens(value);
    }

    return syntax.generate(value, astToTokens);
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/match-graph.js


const MATCH = { type: 'Match' };
const MISMATCH = { type: 'Mismatch' };
const DISALLOW_EMPTY = { type: 'DisallowEmpty' };

const match_graph_LEFTPARENTHESIS = 40;  // (
const match_graph_RIGHTPARENTHESIS = 41; // )

function createCondition(match, thenBranch, elseBranch) {
    // reduce node count
    if (thenBranch === MATCH && elseBranch === MISMATCH) {
        return match;
    }

    if (match === MATCH && thenBranch === MATCH && elseBranch === MATCH) {
        return match;
    }

    if (match.type === 'If' && match.else === MISMATCH && thenBranch === MATCH) {
        thenBranch = match.then;
        match = match.match;
    }

    return {
        type: 'If',
        match,
        then: thenBranch,
        else: elseBranch
    };
}

function isFunctionType(name) {
    return (
        name.length > 2 &&
        name.charCodeAt(name.length - 2) === match_graph_LEFTPARENTHESIS &&
        name.charCodeAt(name.length - 1) === match_graph_RIGHTPARENTHESIS
    );
}

function isEnumCapatible(term) {
    return (
        term.type === 'Keyword' ||
        term.type === 'AtKeyword' ||
        term.type === 'Function' ||
        term.type === 'Type' && isFunctionType(term.name)
    );
}

function groupNode(terms, combinator = ' ', explicit = false) {
    return {
        type: 'Group',
        terms,
        combinator,
        disallowEmpty: false,
        explicit
    };
}

function replaceTypeInGraph(node, replacements, visited = new Set()) {
    if (!visited.has(node)) {
        visited.add(node);

        switch (node.type) {
            case 'If':
                node.match = replaceTypeInGraph(node.match, replacements, visited);
                node.then = replaceTypeInGraph(node.then, replacements, visited);
                node.else = replaceTypeInGraph(node.else, replacements, visited);
                break;

            case 'Type':
                return replacements[node.name] || node;
        }
    }

    return node;
}

function buildGroupMatchGraph(combinator, terms, atLeastOneTermMatched) {
    switch (combinator) {
        case ' ': {
            // Juxtaposing components means that all of them must occur, in the given order.
            //
            // a b c
            // =
            // match a
            //   then match b
            //     then match c
            //       then MATCH
            //       else MISMATCH
            //     else MISMATCH
            //   else MISMATCH
            let result = MATCH;

            for (let i = terms.length - 1; i >= 0; i--) {
                const term = terms[i];

                result = createCondition(
                    term,
                    result,
                    MISMATCH
                );
            };

            return result;
        }

        case '|': {
            // A bar (|) separates two or more alternatives: exactly one of them must occur.
            //
            // a | b | c
            // =
            // match a
            //   then MATCH
            //   else match b
            //     then MATCH
            //     else match c
            //       then MATCH
            //       else MISMATCH

            let result = MISMATCH;
            let map = null;

            for (let i = terms.length - 1; i >= 0; i--) {
                let term = terms[i];

                // reduce sequence of keywords into a Enum
                if (isEnumCapatible(term)) {
                    if (map === null && i > 0 && isEnumCapatible(terms[i - 1])) {
                        map = Object.create(null);
                        result = createCondition(
                            {
                                type: 'Enum',
                                map
                            },
                            MATCH,
                            result
                        );
                    }

                    if (map !== null) {
                        const key = (isFunctionType(term.name) ? term.name.slice(0, -1) : term.name).toLowerCase();
                        if (key in map === false) {
                            map[key] = term;
                            continue;
                        }
                    }
                }

                map = null;

                // create a new conditonal node
                result = createCondition(
                    term,
                    MATCH,
                    result
                );
            };

            return result;
        }

        case '&&': {
            // A double ampersand (&&) separates two or more components,
            // all of which must occur, in any order.

            // Use MatchOnce for groups with a large number of terms,
            // since &&-groups produces at least N!-node trees
            if (terms.length > 5) {
                return {
                    type: 'MatchOnce',
                    terms,
                    all: true
                };
            }

            // Use a combination tree for groups with small number of terms
            //
            // a && b && c
            // =
            // match a
            //   then [b && c]
            //   else match b
            //     then [a && c]
            //     else match c
            //       then [a && b]
            //       else MISMATCH
            //
            // a && b
            // =
            // match a
            //   then match b
            //     then MATCH
            //     else MISMATCH
            //   else match b
            //     then match a
            //       then MATCH
            //       else MISMATCH
            //     else MISMATCH
            let result = MISMATCH;

            for (let i = terms.length - 1; i >= 0; i--) {
                const term = terms[i];
                let thenClause;

                if (terms.length > 1) {
                    thenClause = buildGroupMatchGraph(
                        combinator,
                        terms.filter(function(newGroupTerm) {
                            return newGroupTerm !== term;
                        }),
                        false
                    );
                } else {
                    thenClause = MATCH;
                }

                result = createCondition(
                    term,
                    thenClause,
                    result
                );
            };

            return result;
        }

        case '||': {
            // A double bar (||) separates two or more options:
            // one or more of them must occur, in any order.

            // Use MatchOnce for groups with a large number of terms,
            // since ||-groups produces at least N!-node trees
            if (terms.length > 5) {
                return {
                    type: 'MatchOnce',
                    terms,
                    all: false
                };
            }

            // Use a combination tree for groups with small number of terms
            //
            // a || b || c
            // =
            // match a
            //   then [b || c]
            //   else match b
            //     then [a || c]
            //     else match c
            //       then [a || b]
            //       else MISMATCH
            //
            // a || b
            // =
            // match a
            //   then match b
            //     then MATCH
            //     else MATCH
            //   else match b
            //     then match a
            //       then MATCH
            //       else MATCH
            //     else MISMATCH
            let result = atLeastOneTermMatched ? MATCH : MISMATCH;

            for (let i = terms.length - 1; i >= 0; i--) {
                const term = terms[i];
                let thenClause;

                if (terms.length > 1) {
                    thenClause = buildGroupMatchGraph(
                        combinator,
                        terms.filter(function(newGroupTerm) {
                            return newGroupTerm !== term;
                        }),
                        true
                    );
                } else {
                    thenClause = MATCH;
                }

                result = createCondition(
                    term,
                    thenClause,
                    result
                );
            };

            return result;
        }
    }
}

function buildMultiplierMatchGraph(node) {
    let result = MATCH;
    let matchTerm = buildMatchGraphInternal(node.term);

    if (node.max === 0) {
        // disable repeating of empty match to prevent infinite loop
        matchTerm = createCondition(
            matchTerm,
            DISALLOW_EMPTY,
            MISMATCH
        );

        // an occurrence count is not limited, make a cycle;
        // to collect more terms on each following matching mismatch
        result = createCondition(
            matchTerm,
            null, // will be a loop
            MISMATCH
        );

        result.then = createCondition(
            MATCH,
            MATCH,
            result // make a loop
        );

        if (node.comma) {
            result.then.else = createCondition(
                { type: 'Comma', syntax: node },
                result,
                MISMATCH
            );
        }
    } else {
        // create a match node chain for [min .. max] interval with optional matches
        for (let i = node.min || 1; i <= node.max; i++) {
            if (node.comma && result !== MATCH) {
                result = createCondition(
                    { type: 'Comma', syntax: node },
                    result,
                    MISMATCH
                );
            }

            result = createCondition(
                matchTerm,
                createCondition(
                    MATCH,
                    MATCH,
                    result
                ),
                MISMATCH
            );
        }
    }

    if (node.min === 0) {
        // allow zero match
        result = createCondition(
            MATCH,
            MATCH,
            result
        );
    } else {
        // create a match node chain to collect [0 ... min - 1] required matches
        for (let i = 0; i < node.min - 1; i++) {
            if (node.comma && result !== MATCH) {
                result = createCondition(
                    { type: 'Comma', syntax: node },
                    result,
                    MISMATCH
                );
            }

            result = createCondition(
                matchTerm,
                result,
                MISMATCH
            );
        }
    }

    return result;
}

function buildMatchGraphInternal(node) {
    if (typeof node === 'function') {
        return {
            type: 'Generic',
            fn: node
        };
    }

    switch (node.type) {
        case 'Group': {
            let result = buildGroupMatchGraph(
                node.combinator,
                node.terms.map(buildMatchGraphInternal),
                false
            );

            if (node.disallowEmpty) {
                result = createCondition(
                    result,
                    DISALLOW_EMPTY,
                    MISMATCH
                );
            }

            return result;
        }

        case 'Multiplier':
            return buildMultiplierMatchGraph(node);

        // https://drafts.csswg.org/css-values-5/#boolean
        case 'Boolean': {
            const term = buildMatchGraphInternal(node.term);
            // <boolean-expr[ <test> ]> = not <boolean-expr-group> | <boolean-expr-group> [ [ and <boolean-expr-group> ]* | [ or <boolean-expr-group> ]* ]
            const matchNode = buildMatchGraphInternal(groupNode([
                groupNode([
                    { type: 'Keyword', name: 'not' },
                    { type: 'Type', name: '!boolean-group' }
                ]),
                groupNode([
                    { type: 'Type', name: '!boolean-group' },
                    groupNode([
                        { type: 'Multiplier', comma: false, min: 0, max: 0, term: groupNode([
                            { type: 'Keyword', name: 'and' },
                            { type: 'Type', name: '!boolean-group' }
                        ]) },
                        { type: 'Multiplier', comma: false, min: 0, max: 0, term: groupNode([
                            { type: 'Keyword', name: 'or' },
                            { type: 'Type', name: '!boolean-group' }
                        ]) }
                    ], '|')
                ])
            ], '|'));
            // <boolean-expr-group> = <test> | ( <boolean-expr[ <test> ]> ) | <general-enclosed>
            const booleanGroup = buildMatchGraphInternal(
                groupNode([
                    { type: 'Type', name: '!term' },
                    groupNode([
                        { type: 'Token', value: '(' },
                        { type: 'Type', name: '!self' },
                        { type: 'Token', value: ')' }
                    ]),
                    { type: 'Type', name: 'general-enclosed' }
                ], '|')
            );

            replaceTypeInGraph(booleanGroup, { '!term': term, '!self': matchNode });
            replaceTypeInGraph(matchNode, { '!boolean-group': booleanGroup });

            return matchNode;
        }

        case 'Type':
        case 'Property':
            return {
                type: node.type,
                name: node.name,
                syntax: node
            };

        case 'Keyword':
            return {
                type: node.type,
                name: node.name.toLowerCase(),
                syntax: node
            };

        case 'AtKeyword':
            return {
                type: node.type,
                name: '@' + node.name.toLowerCase(),
                syntax: node
            };

        case 'Function':
            return {
                type: node.type,
                name: node.name.toLowerCase() + '(',
                syntax: node
            };

        case 'String':
            // convert a one char length String to a Token
            if (node.value.length === 3) {
                return {
                    type: 'Token',
                    value: node.value.charAt(1),
                    syntax: node
                };
            }

            // otherwise use it as is
            return {
                type: node.type,
                value: node.value.substr(1, node.value.length - 2).replace(/\\'/g, '\''),
                syntax: node
            };

        case 'Token':
            return {
                type: node.type,
                value: node.value,
                syntax: node
            };

        case 'Comma':
            return {
                type: node.type,
                syntax: node
            };

        default:
            throw new Error('Unknown node type:', node.type);
    }
}

function buildMatchGraph(syntaxTree, ref) {
    if (typeof syntaxTree === 'string') {
        syntaxTree = parse_parse(syntaxTree);
    }

    return {
        type: 'MatchGraph',
        match: buildMatchGraphInternal(syntaxTree),
        syntax: ref || null,
        source: syntaxTree
    };
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/match.js



const { hasOwnProperty: match_hasOwnProperty } = Object.prototype;
const STUB = 0;
const TOKEN = 1;
const OPEN_SYNTAX = 2;
const CLOSE_SYNTAX = 3;

const EXIT_REASON_MATCH = 'Match';
const EXIT_REASON_MISMATCH = 'Mismatch';
const EXIT_REASON_ITERATION_LIMIT = 'Maximum iteration number exceeded (please fill an issue on https://github.com/csstree/csstree/issues)';

const ITERATION_LIMIT = 15000;
let totalIterationCount = 0;

function reverseList(list) {
    let prev = null;
    let next = null;
    let item = list;

    while (item !== null) {
        next = item.prev;
        item.prev = prev;
        prev = item;
        item = next;
    }

    return prev;
}

function areStringsEqualCaseInsensitive(testStr, referenceStr) {
    if (testStr.length !== referenceStr.length) {
        return false;
    }

    for (let i = 0; i < testStr.length; i++) {
        const referenceCode = referenceStr.charCodeAt(i);
        let testCode = testStr.charCodeAt(i);

        // testCode.toLowerCase() for U+0041 LATIN CAPITAL LETTER A (A) .. U+005A LATIN CAPITAL LETTER Z (Z).
        if (testCode >= 0x0041 && testCode <= 0x005A) {
            testCode = testCode | 32;
        }

        if (testCode !== referenceCode) {
            return false;
        }
    }

    return true;
}

function isContextEdgeDelim(token) {
    if (token.type !== (/* inlined export .Delim */9)) {
        return false;
    }

    // Fix matching for unicode-range: U+30??, U+FF00-FF9F
    // Probably we need to check out previous match instead
    return token.value !== '?';
}

function isCommaContextStart(token) {
    if (token === null) {
        return true;
    }

    return (
        token.type === (/* inlined export .Comma */18) ||
        token.type === (/* inlined export .Function */2) ||
        token.type === (/* inlined export .LeftParenthesis */21) ||
        token.type === (/* inlined export .LeftSquareBracket */19) ||
        token.type === (/* inlined export .LeftCurlyBracket */23) ||
        isContextEdgeDelim(token)
    );
}

function isCommaContextEnd(token) {
    if (token === null) {
        return true;
    }

    return (
        token.type === (/* inlined export .RightParenthesis */22) ||
        token.type === (/* inlined export .RightSquareBracket */20) ||
        token.type === (/* inlined export .RightCurlyBracket */24) ||
        (token.type === (/* inlined export .Delim */9) && token.value === '/')
    );
}

function internalMatch(tokens, state, syntaxes) {
    function moveToNextToken() {
        do {
            tokenIndex++;
            token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;
        } while (token !== null && (token.type === (/* inlined export .WhiteSpace */13) || token.type === (/* inlined export .Comment */25)));
    }

    function getNextToken(offset) {
        const nextIndex = tokenIndex + offset;

        return nextIndex < tokens.length ? tokens[nextIndex] : null;
    }

    function stateSnapshotFromSyntax(nextState, prev) {
        return {
            nextState,
            matchStack,
            syntaxStack,
            thenStack,
            tokenIndex,
            prev
        };
    }

    function pushThenStack(nextState) {
        thenStack = {
            nextState,
            matchStack,
            syntaxStack,
            prev: thenStack
        };
    }

    function pushElseStack(nextState) {
        elseStack = stateSnapshotFromSyntax(nextState, elseStack);
    }

    function addTokenToMatch() {
        matchStack = {
            type: TOKEN,
            syntax: state.syntax,
            token,
            prev: matchStack
        };

        moveToNextToken();
        syntaxStash = null;

        if (tokenIndex > longestMatch) {
            longestMatch = tokenIndex;
        }
    }

    function openSyntax() {
        syntaxStack = {
            syntax: state.syntax,
            opts: state.syntax.opts || (syntaxStack !== null && syntaxStack.opts) || null,
            prev: syntaxStack
        };

        matchStack = {
            type: OPEN_SYNTAX,
            syntax: state.syntax,
            token: matchStack.token,
            prev: matchStack
        };
    }

    function closeSyntax() {
        if (matchStack.type === OPEN_SYNTAX) {
            matchStack = matchStack.prev;
        } else {
            matchStack = {
                type: CLOSE_SYNTAX,
                syntax: syntaxStack.syntax,
                token: matchStack.token,
                prev: matchStack
            };
        }

        syntaxStack = syntaxStack.prev;
    }

    let syntaxStack = null;
    let thenStack = null;
    let elseStack = null;

    // null – stashing allowed, nothing stashed
    // false – stashing disabled, nothing stashed
    // anithing else – fail stashable syntaxes, some syntax stashed
    let syntaxStash = null;

    let iterationCount = 0; // count iterations and prevent infinite loop
    let exitReason = null;

    let token = null;
    let tokenIndex = -1;
    let longestMatch = 0;
    let matchStack = {
        type: STUB,
        syntax: null,
        token: null,
        prev: null
    };

    moveToNextToken();

    while (exitReason === null && ++iterationCount < ITERATION_LIMIT) {
        // function mapList(list, fn) {
        //     const result = [];
        //     while (list) {
        //         result.unshift(fn(list));
        //         list = list.prev;
        //     }
        //     return result;
        // }
        // console.log('--\n',
        //     '#' + iterationCount,
        //     require('util').inspect({
        //         match: mapList(matchStack, x => x.type === TOKEN ? x.token && x.token.value : x.syntax ? ({ [OPEN_SYNTAX]: '<', [CLOSE_SYNTAX]: '</' }[x.type] || x.type) + '!' + x.syntax.name : null),
        //         token: token && token.value,
        //         tokenIndex,
        //         syntax: syntax.type + (syntax.id ? ' #' + syntax.id : '')
        //     }, { depth: null })
        // );
        switch (state.type) {
            case 'Match':
                if (thenStack === null) {
                    // turn to MISMATCH when some tokens left unmatched
                    if (token !== null) {
                        // doesn't mismatch if just one token left and it's an IE hack
                        if (tokenIndex !== tokens.length - 1 || (token.value !== '\\0' && token.value !== '\\9')) {
                            state = MISMATCH;
                            break;
                        }
                    }

                    // break the main loop, return a result - MATCH
                    exitReason = EXIT_REASON_MATCH;
                    break;
                }

                // go to next syntax (`then` branch)
                state = thenStack.nextState;

                // check match is not empty
                if (state === DISALLOW_EMPTY) {
                    if (thenStack.matchStack === matchStack) {
                        state = MISMATCH;
                        break;
                    } else {
                        state = MATCH;
                    }
                }

                // close syntax if needed
                while (thenStack.syntaxStack !== syntaxStack) {
                    closeSyntax();
                }

                // pop stack
                thenStack = thenStack.prev;
                break;

            case 'Mismatch':
                // when some syntax is stashed
                if (syntaxStash !== null && syntaxStash !== false) {
                    // there is no else branches or a branch reduce match stack
                    if (elseStack === null || tokenIndex > elseStack.tokenIndex) {
                        // restore state from the stash
                        elseStack = syntaxStash;
                        syntaxStash = false; // disable stashing
                    }
                } else if (elseStack === null) {
                    // no else branches -> break the main loop
                    // return a result - MISMATCH
                    exitReason = EXIT_REASON_MISMATCH;
                    break;
                }

                // go to next syntax (`else` branch)
                state = elseStack.nextState;

                // restore all the rest stack states
                thenStack = elseStack.thenStack;
                syntaxStack = elseStack.syntaxStack;
                matchStack = elseStack.matchStack;
                tokenIndex = elseStack.tokenIndex;
                token = tokenIndex < tokens.length ? tokens[tokenIndex] : null;

                // pop stack
                elseStack = elseStack.prev;
                break;

            case 'MatchGraph':
                state = state.match;
                break;

            case 'If':
                // IMPORTANT: else stack push must go first,
                // since it stores the state of thenStack before changes
                if (state.else !== MISMATCH) {
                    pushElseStack(state.else);
                }

                if (state.then !== MATCH) {
                    pushThenStack(state.then);
                }

                state = state.match;
                break;

            case 'MatchOnce':
                state = {
                    type: 'MatchOnceBuffer',
                    syntax: state,
                    index: 0,
                    mask: 0
                };
                break;

            case 'MatchOnceBuffer': {
                const terms = state.syntax.terms;

                if (state.index === terms.length) {
                    // no matches at all or it's required all terms to be matched
                    if (state.mask === 0 || state.syntax.all) {
                        state = MISMATCH;
                        break;
                    }

                    // a partial match is ok
                    state = MATCH;
                    break;
                }

                // all terms are matched
                if (state.mask === (1 << terms.length) - 1) {
                    state = MATCH;
                    break;
                }

                for (; state.index < terms.length; state.index++) {
                    const matchFlag = 1 << state.index;

                    if ((state.mask & matchFlag) === 0) {
                        // IMPORTANT: else stack push must go first,
                        // since it stores the state of thenStack before changes
                        pushElseStack(state);
                        pushThenStack({
                            type: 'AddMatchOnce',
                            syntax: state.syntax,
                            mask: state.mask | matchFlag
                        });

                        // match
                        state = terms[state.index++];
                        break;
                    }
                }
                break;
            }

            case 'AddMatchOnce':
                state = {
                    type: 'MatchOnceBuffer',
                    syntax: state.syntax,
                    index: 0,
                    mask: state.mask
                };
                break;

            case 'Enum':
                if (token !== null) {
                    let name = token.value.toLowerCase();

                    // drop \0 and \9 hack from keyword name
                    if (name.indexOf('\\') !== -1) {
                        name = name.replace(/\\[09].*$/, '');
                    }

                    if (match_hasOwnProperty.call(state.map, name)) {
                        state = state.map[name];
                        break;
                    }
                }

                state = MISMATCH;
                break;

            case 'Generic': {
                const opts = syntaxStack !== null ? syntaxStack.opts : null;
                const lastTokenIndex = tokenIndex + Math.floor(state.fn(token, getNextToken, opts));

                if (!isNaN(lastTokenIndex) && lastTokenIndex > tokenIndex) {
                    while (tokenIndex < lastTokenIndex) {
                        addTokenToMatch();
                    }

                    state = MATCH;
                } else {
                    state = MISMATCH;
                }

                break;
            }

            case 'Type':
            case 'Property': {
                const syntaxDict = state.type === 'Type' ? 'types' : 'properties';
                const dictSyntax = match_hasOwnProperty.call(syntaxes, syntaxDict) ? syntaxes[syntaxDict][state.name] : null;

                if (!dictSyntax || !dictSyntax.match) {
                    throw new Error(
                        'Bad syntax reference: ' +
                        (state.type === 'Type'
                            ? '<' + state.name + '>'
                            : '<\'' + state.name + '\'>')
                    );
                }

                // stash a syntax for types with low priority
                if (syntaxStash !== false && token !== null && state.type === 'Type') {
                    const lowPriorityMatching =
                        // https://drafts.csswg.org/css-values-4/#custom-idents
                        // When parsing positionally-ambiguous keywords in a property value, a <custom-ident> production
                        // can only claim the keyword if no other unfulfilled production can claim it.
                        (state.name === 'custom-ident' && token.type === (/* inlined export .Ident */1)) ||

                        // https://drafts.csswg.org/css-values-4/#lengths
                        // ... if a `0` could be parsed as either a <number> or a <length> in a property (such as line-height),
                        // it must parse as a <number>
                        (state.name === 'length' && token.value === '0');

                    if (lowPriorityMatching) {
                        if (syntaxStash === null) {
                            syntaxStash = stateSnapshotFromSyntax(state, elseStack);
                        }

                        state = MISMATCH;
                        break;
                    }
                }

                openSyntax();
                state = dictSyntax.matchRef || dictSyntax.match;
                break;
            }

            case 'Keyword': {
                const name = state.name;

                if (token !== null) {
                    let keywordName = token.value;

                    // drop \0 and \9 hack from keyword name
                    if (keywordName.indexOf('\\') !== -1) {
                        keywordName = keywordName.replace(/\\[09].*$/, '');
                    }

                    if (areStringsEqualCaseInsensitive(keywordName, name)) {
                        addTokenToMatch();
                        state = MATCH;
                        break;
                    }
                }

                state = MISMATCH;
                break;
            }

            case 'AtKeyword':
            case 'Function':
                if (token !== null && areStringsEqualCaseInsensitive(token.value, state.name)) {
                    addTokenToMatch();
                    state = MATCH;
                    break;
                }

                state = MISMATCH;
                break;

            case 'Token':
                if (token !== null && token.value === state.value) {
                    addTokenToMatch();
                    state = MATCH;
                    break;
                }

                state = MISMATCH;
                break;

            case 'Comma':
                if (token !== null && token.type === (/* inlined export .Comma */18)) {
                    if (isCommaContextStart(matchStack.token)) {
                        state = MISMATCH;
                    } else {
                        addTokenToMatch();
                        state = isCommaContextEnd(token) ? MISMATCH : MATCH;
                    }
                } else {
                    state = isCommaContextStart(matchStack.token) || isCommaContextEnd(token) ? MATCH : MISMATCH;
                }

                break;

            case 'String':
                let string = '';
                let lastTokenIndex = tokenIndex;

                for (; lastTokenIndex < tokens.length && string.length < state.value.length; lastTokenIndex++) {
                    string += tokens[lastTokenIndex].value;
                }

                if (areStringsEqualCaseInsensitive(string, state.value)) {
                    while (tokenIndex < lastTokenIndex) {
                        addTokenToMatch();
                    }

                    state = MATCH;
                } else {
                    state = MISMATCH;
                }

                break;

            default:
                throw new Error('Unknown node type: ' + state.type);
        }
    }

    totalIterationCount += iterationCount;

    switch (exitReason) {
        case null:
            console.warn('[csstree-match] BREAK after ' + ITERATION_LIMIT + ' iterations');
            exitReason = EXIT_REASON_ITERATION_LIMIT;
            matchStack = null;
            break;

        case EXIT_REASON_MATCH:
            while (syntaxStack !== null) {
                closeSyntax();
            }
            break;

        default:
            matchStack = null;
    }

    return {
        tokens,
        reason: exitReason,
        iterations: iterationCount,
        match: matchStack,
        longestMatch
    };
}

function matchAsList(tokens, matchGraph, syntaxes) {
    const matchResult = internalMatch(tokens, matchGraph, syntaxes || {});

    if (matchResult.match !== null) {
        let item = reverseList(matchResult.match).prev;

        matchResult.match = [];

        while (item !== null) {
            switch (item.type) {
                case OPEN_SYNTAX:
                case CLOSE_SYNTAX:
                    matchResult.match.push({
                        type: item.type,
                        syntax: item.syntax
                    });
                    break;

                default:
                    matchResult.match.push({
                        token: item.token.value,
                        node: item.token.node
                    });
                    break;
            }

            item = item.prev;
        }
    }

    return matchResult;
}

function matchAsTree(tokens, matchGraph, syntaxes) {
    const matchResult = internalMatch(tokens, matchGraph, syntaxes || {});

    if (matchResult.match === null) {
        return matchResult;
    }

    let item = matchResult.match;
    let host = matchResult.match = {
        syntax: matchGraph.syntax || null,
        match: []
    };
    const hostStack = [host];

    // revert a list and start with 2nd item since 1st is a stub item
    item = reverseList(item).prev;

    // build a tree
    while (item !== null) {
        switch (item.type) {
            case OPEN_SYNTAX:
                host.match.push(host = {
                    syntax: item.syntax,
                    match: []
                });
                hostStack.push(host);
                break;

            case CLOSE_SYNTAX:
                hostStack.pop();
                host = hostStack[hostStack.length - 1];
                break;

            default:
                host.match.push({
                    syntax: item.syntax || null,
                    token: item.token.value,
                    node: item.token.node
                });
        }

        item = item.prev;
    }

    return matchResult;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/trace.js
function getTrace(node) {
    function shouldPutToTrace(syntax) {
        if (syntax === null) {
            return false;
        }

        return (
            syntax.type === 'Type' ||
            syntax.type === 'Property' ||
            syntax.type === 'Keyword'
        );
    }

    function hasMatch(matchNode) {
        if (Array.isArray(matchNode.match)) {
            // use for-loop for better perfomance
            for (let i = 0; i < matchNode.match.length; i++) {
                if (hasMatch(matchNode.match[i])) {
                    if (shouldPutToTrace(matchNode.syntax)) {
                        result.unshift(matchNode.syntax);
                    }

                    return true;
                }
            }
        } else if (matchNode.node === node) {
            result = shouldPutToTrace(matchNode.syntax)
                ? [matchNode.syntax]
                : [];

            return true;
        }

        return false;
    }

    let result = null;

    if (this.matched !== null) {
        hasMatch(this.matched);
    }

    return result;
}

function trace_isType(node, type) {
    return testNode(this, node, match => match.type === 'Type' && match.name === type);
}

function isProperty(node, property) {
    return testNode(this, node, match => match.type === 'Property' && match.name === property);
}

function isKeyword(node) {
    return testNode(this, node, match => match.type === 'Keyword');
}

function testNode(match, node, fn) {
    const trace = getTrace.call(match, node);

    if (trace === null) {
        return false;
    }

    return trace.some(fn);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/search.js


function getFirstMatchNode(matchNode) {
    if ('node' in matchNode) {
        return matchNode.node;
    }

    return getFirstMatchNode(matchNode.match[0]);
}

function getLastMatchNode(matchNode) {
    if ('node' in matchNode) {
        return matchNode.node;
    }

    return getLastMatchNode(matchNode.match[matchNode.match.length - 1]);
}

function matchFragments(lexer, ast, match, type, name) {
    function findFragments(matchNode) {
        if (matchNode.syntax !== null &&
            matchNode.syntax.type === type &&
            matchNode.syntax.name === name) {
            const start = getFirstMatchNode(matchNode);
            const end = getLastMatchNode(matchNode);

            lexer.syntax.walk(ast, function(node, item, list) {
                if (node === start) {
                    const nodes = new List();

                    do {
                        nodes.appendData(item.data);

                        if (item.data === end) {
                            break;
                        }

                        item = item.next;
                    } while (item !== null);

                    fragments.push({
                        parent: list,
                        nodes
                    });
                }
            });
        }

        if (Array.isArray(matchNode.match)) {
            matchNode.match.forEach(findFragments);
        }
    }

    const fragments = [];

    if (match.matched !== null) {
        findFragments(match.matched);
    }

    return fragments;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/structure.js


const { hasOwnProperty: structure_hasOwnProperty } = Object.prototype;

function isValidNumber(value) {
    // Number.isInteger(value) && value >= 0
    return (
        typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value &&
        value >= 0
    );
}

function isValidLocation(loc) {
    return (
        Boolean(loc) &&
        isValidNumber(loc.offset) &&
        isValidNumber(loc.line) &&
        isValidNumber(loc.column)
    );
}

function createNodeStructureChecker(type, fields) {
    return function checkNode(node, warn) {
        if (!node || node.constructor !== Object) {
            return warn(node, 'Type of node should be an Object');
        }

        for (let key in node) {
            let valid = true;

            if (structure_hasOwnProperty.call(node, key) === false) {
                continue;
            }

            if (key === 'type') {
                if (node.type !== type) {
                    warn(node, 'Wrong node type `' + node.type + '`, expected `' + type + '`');
                }
            } else if (key === 'loc') {
                if (node.loc === null) {
                    continue;
                } else if (node.loc && node.loc.constructor === Object) {
                    if (typeof node.loc.source !== 'string') {
                        key += '.source';
                    } else if (!isValidLocation(node.loc.start)) {
                        key += '.start';
                    } else if (!isValidLocation(node.loc.end)) {
                        key += '.end';
                    } else {
                        continue;
                    }
                }

                valid = false;
            } else if (fields.hasOwnProperty(key)) {
                valid = false;

                for (let i = 0; !valid && i < fields[key].length; i++) {
                    const fieldType = fields[key][i];

                    switch (fieldType) {
                        case String:
                            valid = typeof node[key] === 'string';
                            break;

                        case Boolean:
                            valid = typeof node[key] === 'boolean';
                            break;

                        case null:
                            valid = node[key] === null;
                            break;

                        default:
                            if (typeof fieldType === 'string') {
                                valid = node[key] && node[key].type === fieldType;
                            } else if (Array.isArray(fieldType)) {
                                valid = node[key] instanceof List;
                            }
                    }
                }
            } else {
                warn(node, 'Unknown field `' + key + '` for ' + type + ' node type');
            }

            if (!valid) {
                warn(node, 'Bad value for `' + type + '.' + key + '`');
            }
        }

        for (const key in fields) {
            if (structure_hasOwnProperty.call(fields, key) &&
                structure_hasOwnProperty.call(node, key) === false) {
                warn(node, 'Field `' + type + '.' + key + '` is missed');
            }
        }
    };
}

function genTypesList(fieldTypes, path) {
    const docsTypes = [];

    for (let i = 0; i < fieldTypes.length; i++) {
        const fieldType = fieldTypes[i];
        if (fieldType === String || fieldType === Boolean) {
            docsTypes.push(fieldType.name.toLowerCase());
        } else if (fieldType === null) {
            docsTypes.push('null');
        } else if (typeof fieldType === 'string') {
            docsTypes.push(fieldType);
        } else if (Array.isArray(fieldType)) {
            docsTypes.push('List<' + (genTypesList(fieldType, path) || 'any') + '>'); // TODO: use type enum
        } else {
            throw new Error('Wrong value `' + fieldType + '` in `' + path + '` structure definition');
        }
    }

    return docsTypes.join(' | ');
}

function processStructure(name, nodeType) {
    const structure = nodeType.structure;
    const fields = {
        type: String,
        loc: true
    };
    const docs = {
        type: '"' + name + '"'
    };

    for (const key in structure) {
        if (structure_hasOwnProperty.call(structure, key) === false) {
            continue;
        }

        const fieldTypes = fields[key] = Array.isArray(structure[key])
            ? structure[key].slice()
            : [structure[key]];

        docs[key] = genTypesList(fieldTypes, name + '.' + key);
    }

    return {
        docs,
        check: createNodeStructureChecker(name, fields)
    };
}

function getStructureFromConfig(config) {
    const structure = {};

    if (config.node) {
        for (const name in config.node) {
            if (structure_hasOwnProperty.call(config.node, name)) {
                const nodeType = config.node[name];

                if (nodeType.structure) {
                    structure[name] = processStructure(name, nodeType);
                } else {
                    throw new Error('Missed `structure` field in `' + name + '` node type definition');
                }
            }
        }
    }

    return structure;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/lexer/Lexer.js













function dumpMapSyntax(map, compact, syntaxAsAst) {
    const result = {};

    for (const name in map) {
        if (map[name].syntax) {
            result[name] = syntaxAsAst
                ? map[name].syntax
                : generate_generate(map[name].syntax, { compact });
        }
    }

    return result;
}

function dumpAtruleMapSyntax(map, compact, syntaxAsAst) {
    const result = {};

    for (const [name, atrule] of Object.entries(map)) {
        result[name] = {
            prelude: atrule.prelude && (
                syntaxAsAst
                    ? atrule.prelude.syntax
                    : generate_generate(atrule.prelude.syntax, { compact })
            ),
            descriptors: atrule.descriptors && dumpMapSyntax(atrule.descriptors, compact, syntaxAsAst)
        };
    }

    return result;
}

function valueHasVar(tokens) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].value.toLowerCase() === 'var(') {
            return true;
        }
    }

    return false;
}

function syntaxHasTopLevelCommaMultiplier(syntax) {
    const singleTerm = syntax.terms[0];

    return (
        syntax.explicit === false &&
        syntax.terms.length === 1 &&
        singleTerm.type === 'Multiplier' &&
        singleTerm.comma === true
    );
}

function buildMatchResult(matched, error, iterations) {
    return {
        matched,
        iterations,
        error,
        ...trace_namespaceObject
    };
}

function matchSyntax(lexer, syntax, value, useCssWideKeywords) {
    const tokens = prepare_tokens(value, lexer.syntax);
    let result;

    if (valueHasVar(tokens)) {
        return buildMatchResult(null, new Error('Matching for a tree with var() is not supported'));
    }

    if (useCssWideKeywords) {
        result = matchAsTree(tokens, lexer.cssWideKeywordsSyntax, lexer);
    }

    if (!useCssWideKeywords || !result.match) {
        result = matchAsTree(tokens, syntax.match, lexer);
        if (!result.match) {
            return buildMatchResult(
                null,
                new SyntaxMatchError(result.reason, syntax.syntax, value, result),
                result.iterations
            );
        }
    }

    return buildMatchResult(result.match, null, result.iterations);
}

class Lexer {
    constructor(config, syntax, structure) {
        this.cssWideKeywords = cssWideKeywords;
        this.syntax = syntax;
        this.generic = false;
        this.units = { ...units_namespaceObject };
        this.atrules = Object.create(null);
        this.properties = Object.create(null);
        this.types = Object.create(null);
        this.structure = structure || getStructureFromConfig(config);

        if (config) {
            if (config.cssWideKeywords) {
                this.cssWideKeywords = config.cssWideKeywords;
            }

            if (config.units) {
                for (const group of Object.keys(units_namespaceObject)) {
                    if (Array.isArray(config.units[group])) {
                        this.units[group] = config.units[group];
                    }
                }
            }

            if (config.types) {
                for (const [name, type] of Object.entries(config.types)) {
                    this.addType_(name, type);
                }
            }

            if (config.generic) {
                this.generic = true;
                for (const [name, value] of Object.entries(createGenericTypes(this.units))) {
                    this.addType_(name, value);
                }
            }

            if (config.atrules) {
                for (const [name, atrule] of Object.entries(config.atrules)) {
                    this.addAtrule_(name, atrule);
                }
            }

            if (config.properties) {
                for (const [name, property] of Object.entries(config.properties)) {
                    this.addProperty_(name, property);
                }
            }
        }

        this.cssWideKeywordsSyntax = buildMatchGraph(this.cssWideKeywords.join(' |  '));
    }

    checkStructure(ast) {
        function collectWarning(node, message) {
            warns.push({ node, message });
        }

        const structure = this.structure;
        const warns = [];

        this.syntax.walk(ast, function(node) {
            if (structure.hasOwnProperty(node.type)) {
                structure[node.type].check(node, collectWarning);
            } else {
                collectWarning(node, 'Unknown node type `' + node.type + '`');
            }
        });

        return warns.length ? warns : false;
    }

    createDescriptor(syntax, type, name, parent = null) {
        const ref = {
            type,
            name
        };
        const descriptor = {
            type,
            name,
            parent,
            serializable: typeof syntax === 'string' || (syntax && typeof syntax.type === 'string'),
            syntax: null,
            match: null,
            matchRef: null // used for properties when a syntax referenced as <'property'> in other syntax definitions
        };

        if (typeof syntax === 'function') {
            descriptor.match = buildMatchGraph(syntax, ref);
        } else {
            if (typeof syntax === 'string') {
                // lazy parsing on first access
                Object.defineProperty(descriptor, 'syntax', {
                    get() {
                        Object.defineProperty(descriptor, 'syntax', {
                            value: parse_parse(syntax)
                        });

                        return descriptor.syntax;
                    }
                });
            } else {
                descriptor.syntax = syntax;
            }

            // lazy graph build on first access
            Object.defineProperty(descriptor, 'match', {
                get() {
                    Object.defineProperty(descriptor, 'match', {
                        value: buildMatchGraph(descriptor.syntax, ref)
                    });

                    return descriptor.match;
                }
            });

            if (type === 'Property') {
                Object.defineProperty(descriptor, 'matchRef', {
                    get() {
                        const syntax = descriptor.syntax;
                        const value = syntaxHasTopLevelCommaMultiplier(syntax)
                            ? buildMatchGraph({
                                ...syntax,
                                terms: [syntax.terms[0].term]
                            }, ref)
                            : null;

                        Object.defineProperty(descriptor, 'matchRef', {
                            value
                        });

                        return value;
                    }
                });
            }
        }

        return descriptor;
    }
    addAtrule_(name, syntax) {
        if (!syntax) {
            return;
        }

        this.atrules[name] = {
            type: 'Atrule',
            name: name,
            prelude: syntax.prelude ? this.createDescriptor(syntax.prelude, 'AtrulePrelude', name) : null,
            descriptors: syntax.descriptors
                ? Object.keys(syntax.descriptors).reduce(
                    (map, descName) => {
                        map[descName] = this.createDescriptor(syntax.descriptors[descName], 'AtruleDescriptor', descName, name);
                        return map;
                    },
                    Object.create(null)
                )
                : null
        };
    }
    addProperty_(name, syntax) {
        if (!syntax) {
            return;
        }

        this.properties[name] = this.createDescriptor(syntax, 'Property', name);
    }
    addType_(name, syntax) {
        if (!syntax) {
            return;
        }

        this.types[name] = this.createDescriptor(syntax, 'Type', name);
    }

    checkAtruleName(atruleName) {
        if (!this.getAtrule(atruleName)) {
            return new SyntaxReferenceError('Unknown at-rule', '@' + atruleName);
        }
    }
    checkAtrulePrelude(atruleName, prelude) {
        const error = this.checkAtruleName(atruleName);

        if (error) {
            return error;
        }

        const atrule = this.getAtrule(atruleName);

        if (!atrule.prelude && prelude) {
            return new SyntaxError('At-rule `@' + atruleName + '` should not contain a prelude');
        }

        if (atrule.prelude && !prelude) {
            if (!matchSyntax(this, atrule.prelude, '', false).matched) {
                return new SyntaxError('At-rule `@' + atruleName + '` should contain a prelude');
            }
        }
    }
    checkAtruleDescriptorName(atruleName, descriptorName) {
        const error = this.checkAtruleName(atruleName);

        if (error) {
            return error;
        }

        const atrule = this.getAtrule(atruleName);
        const descriptor = names_keyword(descriptorName);

        if (!atrule.descriptors) {
            return new SyntaxError('At-rule `@' + atruleName + '` has no known descriptors');
        }

        if (!atrule.descriptors[descriptor.name] &&
            !atrule.descriptors[descriptor.basename]) {
            return new SyntaxReferenceError('Unknown at-rule descriptor', descriptorName);
        }
    }
    checkPropertyName(propertyName) {
        if (!this.getProperty(propertyName)) {
            return new SyntaxReferenceError('Unknown property', propertyName);
        }
    }

    matchAtrulePrelude(atruleName, prelude) {
        const error = this.checkAtrulePrelude(atruleName, prelude);

        if (error) {
            return buildMatchResult(null, error);
        }

        const atrule = this.getAtrule(atruleName);

        if (!atrule.prelude) {
            return buildMatchResult(null, null);
        }

        return matchSyntax(this, atrule.prelude, prelude || '', false);
    }
    matchAtruleDescriptor(atruleName, descriptorName, value) {
        const error = this.checkAtruleDescriptorName(atruleName, descriptorName);

        if (error) {
            return buildMatchResult(null, error);
        }

        const atrule = this.getAtrule(atruleName);
        const descriptor = names_keyword(descriptorName);

        return matchSyntax(this, atrule.descriptors[descriptor.name] || atrule.descriptors[descriptor.basename], value, false);
    }
    matchDeclaration(node) {
        if (node.type !== 'Declaration') {
            return buildMatchResult(null, new Error('Not a Declaration node'));
        }

        return this.matchProperty(node.property, node.value);
    }
    matchProperty(propertyName, value) {
        // don't match syntax for a custom property at the moment
        if (names_property(propertyName).custom) {
            return buildMatchResult(null, new Error('Lexer matching doesn\'t applicable for custom properties'));
        }

        const error = this.checkPropertyName(propertyName);

        if (error) {
            return buildMatchResult(null, error);
        }

        return matchSyntax(this, this.getProperty(propertyName), value, true);
    }
    matchType(typeName, value) {
        const typeSyntax = this.getType(typeName);

        if (!typeSyntax) {
            return buildMatchResult(null, new SyntaxReferenceError('Unknown type', typeName));
        }

        return matchSyntax(this, typeSyntax, value, false);
    }
    match(syntax, value) {
        if (typeof syntax !== 'string' && (!syntax || !syntax.type)) {
            return buildMatchResult(null, new SyntaxReferenceError('Bad syntax'));
        }

        if (typeof syntax === 'string' || !syntax.match) {
            syntax = this.createDescriptor(syntax, 'Type', 'anonymous');
        }

        return matchSyntax(this, syntax, value, false);
    }

    findValueFragments(propertyName, value, type, name) {
        return matchFragments(this, value, this.matchProperty(propertyName, value), type, name);
    }
    findDeclarationValueFragments(declaration, type, name) {
        return matchFragments(this, declaration.value, this.matchDeclaration(declaration), type, name);
    }
    findAllFragments(ast, type, name) {
        const result = [];

        this.syntax.walk(ast, {
            visit: 'Declaration',
            enter: (declaration) => {
                result.push.apply(result, this.findDeclarationValueFragments(declaration, type, name));
            }
        });

        return result;
    }

    getAtrule(atruleName, fallbackBasename = true) {
        const atrule = names_keyword(atruleName);
        const atruleEntry = atrule.vendor && fallbackBasename
            ? this.atrules[atrule.name] || this.atrules[atrule.basename]
            : this.atrules[atrule.name];

        return atruleEntry || null;
    }
    getAtrulePrelude(atruleName, fallbackBasename = true) {
        const atrule = this.getAtrule(atruleName, fallbackBasename);

        return atrule && atrule.prelude || null;
    }
    getAtruleDescriptor(atruleName, name) {
        return this.atrules.hasOwnProperty(atruleName) && this.atrules.declarators
            ? this.atrules[atruleName].declarators[name] || null
            : null;
    }
    getProperty(propertyName, fallbackBasename = true) {
        const property = names_property(propertyName);
        const propertyEntry = property.vendor && fallbackBasename
            ? this.properties[property.name] || this.properties[property.basename]
            : this.properties[property.name];

        return propertyEntry || null;
    }
    getType(name) {
        return hasOwnProperty.call(this.types, name) ? this.types[name] : null;
    }

    validate() {
        function syntaxRef(name, isType) {
            return isType ? `<${name}>` : `<'${name}'>`;
        }

        function validate(syntax, name, broken, descriptor) {
            if (broken.has(name)) {
                return broken.get(name);
            }

            broken.set(name, false);
            if (descriptor.syntax !== null) {
                walk_walk(descriptor.syntax, function(node) {
                    if (node.type !== 'Type' && node.type !== 'Property') {
                        return;
                    }

                    const map = node.type === 'Type' ? syntax.types : syntax.properties;
                    const brokenMap = node.type === 'Type' ? brokenTypes : brokenProperties;

                    if (!hasOwnProperty.call(map, node.name)) {
                        errors.push(`${syntaxRef(name, broken === brokenTypes)} used missed syntax definition ${syntaxRef(node.name, node.type === 'Type')}`);
                        broken.set(name, true);
                    } else if (validate(syntax, node.name, brokenMap, map[node.name])) {
                        errors.push(`${syntaxRef(name, broken === brokenTypes)} used broken syntax definition ${syntaxRef(node.name, node.type === 'Type')}`);
                        broken.set(name, true);
                    }
                }, this);
            }
        }

        const errors = [];
        let brokenTypes = new Map();
        let brokenProperties = new Map();

        for (const key in this.types) {
            validate(this, key, brokenTypes, this.types[key]);
        }

        for (const key in this.properties) {
            validate(this, key, brokenProperties, this.properties[key]);
        }

        const brokenTypesArray = [...brokenTypes.keys()].filter(name => brokenTypes.get(name));
        const brokenPropertiesArray = [...brokenProperties.keys()].filter(name => brokenProperties.get(name));

        if (brokenTypesArray.length || brokenPropertiesArray.length) {
            return {
                errors,
                types: brokenTypesArray,
                properties: brokenPropertiesArray
            };
        }

        return null;
    }
    dump(syntaxAsAst, pretty) {
        return {
            generic: this.generic,
            cssWideKeywords: this.cssWideKeywords,
            units: this.units,
            types: dumpMapSyntax(this.types, !pretty, syntaxAsAst),
            properties: dumpMapSyntax(this.properties, !pretty, syntaxAsAst),
            atrules: dumpAtruleMapSyntax(this.atrules, !pretty, syntaxAsAst)
        };
    }
    toString() {
        return JSON.stringify(this.dump());
    }
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/config/mix.js
function appendOrSet(a, b) {
    if (typeof b === 'string' && /^\s*\|/.test(b)) {
        return typeof a === 'string'
            ? a + b
            : b.replace(/^\s*\|\s*/, '');
    }

    return b || null;
}

function extractProps(obj, props) {
    const result = Object.create(null);

    for (const prop of Object.keys(obj)) {
        if (props.includes(prop)) {
            result[prop] = obj[prop];
        }
    }

    return result;
}

function mergeDicts(base, ext, fields) {
    const result = { ...base };

    for (const [key, props] of Object.entries(ext)) {
        result[key] = {
            ...result[key],
            ...fields ? extractProps(props, fields) : props
        };
    }

    return result;
}

function mix(dest, src) {
    const result = { ...dest };

    for (const [prop, value] of Object.entries(src)) {
        switch (prop) {
            case 'generic':
                result[prop] = Boolean(value);
                break;

            case 'cssWideKeywords':
                result[prop] = dest[prop]
                    ? [...dest[prop], ...value]
                    : value || [];
                break;

            case 'units':
                result[prop] = { ...dest[prop] };
                for (const [name, patch] of Object.entries(value)) {
                    result[prop][name] = Array.isArray(patch) ? patch : [];
                }
                break;

            case 'atrules':
                result[prop] = { ...dest[prop] };

                for (const [name, atrule] of Object.entries(value)) {
                    const exists = result[prop][name] || {};
                    const current = result[prop][name] = {
                        prelude: exists.prelude || null,
                        descriptors: {
                            ...exists.descriptors
                        }
                    };

                    if (!atrule) {
                        continue;
                    }

                    current.prelude = atrule.prelude
                        ? appendOrSet(current.prelude, atrule.prelude)
                        : current.prelude || null;

                    for (const [descriptorName, descriptorValue] of Object.entries(atrule.descriptors || {})) {
                        current.descriptors[descriptorName] = descriptorValue
                            ? appendOrSet(current.descriptors[descriptorName], descriptorValue)
                            : null;
                    }

                    if (!Object.keys(current.descriptors).length) {
                        current.descriptors = null;
                    }
                }
                break;

            case 'types':
            case 'properties':
                result[prop] = { ...dest[prop] };
                for (const [name, syntax] of Object.entries(value)) {
                    result[prop][name] = appendOrSet(result[prop][name], syntax);
                }
                break;

            case 'parseContext':
                result[prop] = {
                    ...dest[prop],
                    ...value
                };
                break;

            case 'scope':
            case 'features':
                result[prop] = mergeDicts(dest[prop], value);
                break;

            case 'atrule':
            case 'pseudo':
                result[prop] = mergeDicts(dest[prop], value, ['parse']);
                break;

            case 'node':
                result[prop] = mergeDicts(dest[prop], value, ['name', 'structure', 'parse', 'generate', 'walkContext']);
                break;
        }
    }

    return result;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/create.js








function createSyntax(config) {
    const parse = createParser(config);
    const walk = createWalker(config);
    const generate = createGenerator(config);
    const { fromPlainObject, toPlainObject } = createConvertor(walk);

    const syntax = {
        lexer: null,
        createLexer: config => new Lexer(config, syntax, syntax.lexer.structure),

        tokenize: tokenizer_tokenize,
        parse,
        generate,

        walk,
        find: walk.find,
        findLast: walk.findLast,
        findAll: walk.findAll,

        fromPlainObject,
        toPlainObject,

        fork(extension) {
            const base = mix({}, config); // copy of config

            return createSyntax(
                typeof extension === 'function'
                    ? extension(base) // TODO: remove Object.assign as second parameter
                    : mix(base, extension)
            );
        }
    };

    syntax.lexer = new Lexer({
        generic: config.generic,
        cssWideKeywords: config.cssWideKeywords,
        units: config.units,
        types: config.types,
        atrules: config.atrules,
        properties: config.properties,
        node: config.node
    }, syntax);

    return syntax;
};

/* export default */ var create = (config => createSyntax(mix({}, config)));

;// CONCATENATED MODULE: ../../node_modules/css-tree/dist/data.js
/* export default */ var dist_data = ({
    "generic": true,
    "cssWideKeywords": [
        "initial",
        "inherit",
        "unset",
        "revert",
        "revert-layer"
    ],
    "units": {
        "angle": [
            "deg",
            "grad",
            "rad",
            "turn"
        ],
        "decibel": [
            "db"
        ],
        "flex": [
            "fr"
        ],
        "frequency": [
            "hz",
            "khz"
        ],
        "length": [
            "cm",
            "mm",
            "q",
            "in",
            "pt",
            "pc",
            "px",
            "em",
            "rem",
            "ex",
            "rex",
            "cap",
            "rcap",
            "ch",
            "rch",
            "ic",
            "ric",
            "lh",
            "rlh",
            "vw",
            "svw",
            "lvw",
            "dvw",
            "vh",
            "svh",
            "lvh",
            "dvh",
            "vi",
            "svi",
            "lvi",
            "dvi",
            "vb",
            "svb",
            "lvb",
            "dvb",
            "vmin",
            "svmin",
            "lvmin",
            "dvmin",
            "vmax",
            "svmax",
            "lvmax",
            "dvmax",
            "cqw",
            "cqh",
            "cqi",
            "cqb",
            "cqmin",
            "cqmax"
        ],
        "resolution": [
            "dpi",
            "dpcm",
            "dppx",
            "x"
        ],
        "semitones": [
            "st"
        ],
        "time": [
            "s",
            "ms"
        ]
    },
    "types": {
        "abs()": "abs( <calc-sum> )",
        "absolute-size": "xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large",
        "acos()": "acos( <calc-sum> )",
        "alpha-value": "<number>|<percentage>",
        "an+b": "odd|even|<integer>|<n-dimension>|'+'? † n|-n|<ndashdigit-dimension>|'+'? † <ndashdigit-ident>|<dashndashdigit-ident>|<n-dimension> <signed-integer>|'+'? † n <signed-integer>|-n <signed-integer>|<ndash-dimension> <signless-integer>|'+'? † n- <signless-integer>|-n- <signless-integer>|<n-dimension> ['+'|'-'] <signless-integer>|'+'? † n ['+'|'-'] <signless-integer>|-n ['+'|'-'] <signless-integer>",
        "anchor()": "anchor( <anchor-name>?&&<anchor-side> , <length-percentage>? )",
        "anchor-name": "<dashed-ident>",
        "anchor-side": "inside|outside|top|left|right|bottom|start|end|self-start|self-end|<percentage>|center",
        "anchor-size": "width|height|block|inline|self-block|self-inline",
        "anchor-size()": "anchor-size( [<anchor-name>||<anchor-size>]? , <length-percentage>? )",
        "angle-percentage": "<angle>|<percentage>",
        "angular-color-hint": "<angle-percentage>|<zero>",
        "angular-color-stop": "<color> <color-stop-angle>?",
        "angular-color-stop-list": "<angular-color-stop> , [<angular-color-hint>? , <angular-color-stop>]#?",
        "animateable-feature": "scroll-position|contents|<custom-ident>",
        "animation-action": "none|play|play-once|play-forwards|play-backwards|pause|reset|replay",
        "asin()": "asin( <calc-sum> )",
        "atan()": "atan( <calc-sum> )",
        "atan2()": "atan2( <calc-sum> , <calc-sum> )",
        "attachment": "scroll|fixed|local",
        "attr()": "attr( <attr-name> <attr-type>? , <declaration-value>? )",
        "attr-matcher": "['~'|'|'|'^'|'$'|'*']? '='",
        "attr-modifier": "i|s",
        "attr-type": "type( <syntax> )|raw-string|number|<attr-unit>",
        "attribute-selector": "'[' <wq-name> ']'|'[' <wq-name> <attr-matcher> [<string-token>|<ident-token>] <attr-modifier>? ']'",
        "auto-repeat": "repeat( [auto-fill|auto-fit] , [<line-names>? <fixed-size>]+ <line-names>? )",
        "auto-track-list": "[<line-names>? [<fixed-size>|<fixed-repeat>]]* <line-names>? <auto-repeat> [<line-names>? [<fixed-size>|<fixed-repeat>]]* <line-names>?",
        "axis": "block|inline|x|y",
        "baseline-position": "[first|last]? baseline",
        "basic-shape": "<inset()>|<xywh()>|<rect()>|<circle()>|<ellipse()>|<polygon()>|<path()>",
        "basic-shape-rect": "<inset()>|<rect()>|<xywh()>",
        "bg-clip": "<visual-box>|border-area|text",
        "bg-image": "<image>|none",
        "bg-layer": "<bg-image>||<bg-position> [/ <bg-size>]?||<repeat-style>||<attachment>||<visual-box>||<visual-box>",
        "bg-position": "[[left|center|right|top|bottom|<length-percentage>]|[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]|[center|[left|right] <length-percentage>?]&&[center|[top|bottom] <length-percentage>?]]",
        "bg-size": "[<length-percentage [0,∞]>|auto]{1,2}|cover|contain",
        "blend-mode": "normal|multiply|screen|overlay|darken|lighten|color-dodge|color-burn|hard-light|soft-light|difference|exclusion|hue|saturation|color|luminosity",
        "blur()": "blur( <length>? )",
        "brightness()": "brightness( [<number>|<percentage>]? )",
        "calc()": "calc( <calc-sum> )",
        "calc-constant": "e|pi|infinity|-infinity|NaN",
        "calc-product": "<calc-value> ['*' <calc-value>|'/' <number>]*",
        "calc-size()": "calc-size( <calc-size-basis> , <calc-sum> )",
        "calc-size-basis": "<intrinsic-size-keyword>|<calc-size()>|any|<calc-sum>",
        "calc-sum": "<calc-product> [['+'|'-'] <calc-product>]*",
        "calc-value": "<number>|<dimension>|<percentage>|<calc-constant>|( <calc-sum> )",
        "cf-final-image": "<image>|<color>",
        "cf-mixing-image": "<percentage>?&&<image>",
        "circle()": "circle( <radial-size>? [at <position>]? )",
        "clamp()": "clamp( <calc-sum>#{3} )",
        "class-selector": "'.' <ident-token>",
        "clip-source": "<url>",
        "color": "<color-base>|currentColor|<system-color>|<device-cmyk()>|<light-dark()>|<-non-standard-color>",
        "color()": "color( <colorspace-params> [/ [<alpha-value>|none]]? )",
        "color-base": "<hex-color>|<color-function>|<named-color>|<color-mix()>|transparent",
        "color-function": "<rgb()>|<rgba()>|<hsl()>|<hsla()>|<hwb()>|<lab()>|<lch()>|<oklab()>|<oklch()>|<color()>",
        "color-interpolation-method": "in [<rectangular-color-space>|<polar-color-space> <hue-interpolation-method>?|<custom-color-space>]",
        "color-mix()": "color-mix( <color-interpolation-method> , [<color>&&<percentage [0,100]>?]#{2} )",
        "color-stop": "<color-stop-length>|<color-stop-angle>",
        "color-stop-angle": "[<angle-percentage>|<zero>]{1,2}",
        "color-stop-length": "<length-percentage>{1,2}",
        "color-stop-list": "<linear-color-stop> , [<linear-color-hint>? , <linear-color-stop>]#?",
        "colorspace-params": "[<predefined-rgb-params>|<xyz-params>]",
        "combinator": "'>'|'+'|'~'|['|' '|']",
        "common-lig-values": "[common-ligatures|no-common-ligatures]",
        "compat-auto": "searchfield|textarea|checkbox|radio|menulist|listbox|meter|progress-bar|button",
        "compat-special": "textfield|menulist-button",
        "complex-selector": "<complex-selector-unit> [<combinator>? <complex-selector-unit>]*",
        "complex-selector-list": "<complex-selector>#",
        "composite-style": "clear|copy|source-over|source-in|source-out|source-atop|destination-over|destination-in|destination-out|destination-atop|xor",
        "compositing-operator": "add|subtract|intersect|exclude",
        "compound-selector": "[<type-selector>? <subclass-selector>*]!",
        "compound-selector-list": "<compound-selector>#",
        "conic-gradient()": "conic-gradient( [<conic-gradient-syntax>] )",
        "conic-gradient-syntax": "[[[from [<angle>|<zero>]]? [at <position>]?]||<color-interpolation-method>]? , <angular-color-stop-list>",
        "container-condition": "not <query-in-parens>|<query-in-parens> [[and <query-in-parens>]*|[or <query-in-parens>]*]",
        "container-name": "<custom-ident>",
        "container-query": "not <query-in-parens>|<query-in-parens> [[and <query-in-parens>]*|[or <query-in-parens>]*]",
        "content-distribution": "space-between|space-around|space-evenly|stretch",
        "content-list": "[<string>|contents|<image>|<counter>|<quote>|<target>|<leader()>|<attr()>]+",
        "content-position": "center|start|end|flex-start|flex-end",
        "content-replacement": "<image>",
        "contextual-alt-values": "[contextual|no-contextual]",
        "contrast()": "contrast( [<number>|<percentage>]? )",
        "coord-box": "content-box|padding-box|border-box|fill-box|stroke-box|view-box",
        "corner-shape-value": "round|scoop|bevel|notch|square|squircle|<superellipse()>",
        "cos()": "cos( <calc-sum> )",
        "counter": "<counter()>|<counters()>",
        "counter()": "counter( <counter-name> , <counter-style>? )",
        "counter-name": "<custom-ident>",
        "counter-style": "<counter-style-name>|symbols( )",
        "counter-style-name": "<custom-ident>",
        "counters()": "counters( <counter-name> , <string> , <counter-style>? )",
        "cross-fade()": "cross-fade( <cf-mixing-image> , <cf-final-image>? )",
        "cubic-bezier()": "cubic-bezier( [<number [0,1]> , <number>]#{2} )",
        "cubic-bezier-easing-function": "ease|ease-in|ease-out|ease-in-out|cubic-bezier( <number [0,1]> , <number> , <number [0,1]> , <number> )",
        "cursor-predefined": "auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|text|vertical-text|alias|copy|move|no-drop|not-allowed|e-resize|n-resize|ne-resize|nw-resize|s-resize|se-resize|sw-resize|w-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|col-resize|row-resize|all-scroll|zoom-in|zoom-out|grab|grabbing",
        "custom-color-space": "<dashed-ident>",
        "custom-params": "<dashed-ident> [<number>|<percentage>|none]+",
        "dasharray": "[[<length-percentage>|<number>]+]#",
        "dashndashdigit-ident": "<ident-token>",
        "deprecated-system-color": "ActiveBorder|ActiveCaption|AppWorkspace|Background|ButtonHighlight|ButtonShadow|CaptionText|InactiveBorder|InactiveCaption|InactiveCaptionText|InfoBackground|InfoText|Menu|MenuText|Scrollbar|ThreeDDarkShadow|ThreeDFace|ThreeDHighlight|ThreeDLightShadow|ThreeDShadow|Window|WindowFrame|WindowText",
        "discretionary-lig-values": "[discretionary-ligatures|no-discretionary-ligatures]",
        "display-box": "contents|none",
        "display-inside": "flow|flow-root|table|flex|grid|ruby",
        "display-internal": "table-row-group|table-header-group|table-footer-group|table-row|table-cell|table-column-group|table-column|table-caption|ruby-base|ruby-text|ruby-base-container|ruby-text-container",
        "display-legacy": "inline-block|inline-list-item|inline-table|inline-flex|inline-grid",
        "display-listitem": "<display-outside>?&&[flow|flow-root]?&&list-item",
        "display-outside": "block|inline|run-in",
        "drop-shadow()": "drop-shadow( [<color>?&&<length>{2,3}] )",
        "dynamic-range-limit-mix()": "dynamic-range-limit-mix( [<'dynamic-range-limit'>&&<percentage [0,100]>]#{2,} )",
        "easing-function": "<linear-easing-function>|<cubic-bezier-easing-function>|<step-easing-function>",
        "east-asian-variant-values": "[jis78|jis83|jis90|jis04|simplified|traditional]",
        "east-asian-width-values": "[full-width|proportional-width]",
        "element()": "element( <custom-ident> , [first|start|last|first-except]? )|element( <id-selector> )",
        "ellipse()": "ellipse( <radial-size>? [at <position>]? )",
        "env()": "env( <custom-ident> , <declaration-value>? )",
        "exp()": "exp( <calc-sum> )",
        "explicit-track-list": "[<line-names>? <track-size>]+ <line-names>?",
        "family-name": "<string>|<custom-ident>+",
        "feature-tag-value": "<string> [<integer>|on|off]?",
        "feature-type": "@stylistic|@historical-forms|@styleset|@character-variant|@swash|@ornaments|@annotation",
        "feature-value-block": "<feature-type> '{' <feature-value-declaration-list> '}'",
        "feature-value-block-list": "<feature-value-block>+",
        "feature-value-declaration": "<custom-ident> : <integer>+ ;",
        "feature-value-declaration-list": "<feature-value-declaration>",
        "feature-value-name": "<custom-ident>",
        "filter-function": "<blur()>|<brightness()>|<contrast()>|<drop-shadow()>|<grayscale()>|<hue-rotate()>|<invert()>|<opacity()>|<saturate()>|<sepia()>",
        "filter-value-list": "[<filter-function>|<url>]+",
        "final-bg-layer": "<bg-image>||<bg-position> [/ <bg-size>]?||<repeat-style>||<attachment>||<visual-box>||<visual-box>||<'background-color'>",
        "fit-content()": "fit-content( <length-percentage [0,∞]> )",
        "fixed-breadth": "<length-percentage>",
        "fixed-repeat": "repeat( [<integer [1,∞]>] , [<line-names>? <fixed-size>]+ <line-names>? )",
        "fixed-size": "<fixed-breadth>|minmax( <fixed-breadth> , <track-breadth> )|minmax( <inflexible-breadth> , <fixed-breadth> )",
        "font-stretch-absolute": "normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded|<percentage>",
        "font-variant-css2": "normal|small-caps",
        "font-weight-absolute": "normal|bold|<number [1,1000]>",
        "font-width-css3": "normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded",
        "form-control-identifier": "select",
        "frequency-percentage": "<frequency>|<percentage>",
        "generic-complete": "serif|sans-serif|system-ui|cursive|fantasy|math|monospace",
        "general-enclosed": "[<function-token> <any-value>? )]|[( <any-value>? )]",
        "generic-family": "<generic-script-specific>|<generic-complete>|<generic-incomplete>|<-non-standard-generic-family>",
        "generic-incomplete": "ui-serif|ui-sans-serif|ui-monospace|ui-rounded",
        "geometry-box": "<shape-box>|fill-box|stroke-box|view-box",
        "gradient": "<linear-gradient()>|<repeating-linear-gradient()>|<radial-gradient()>|<repeating-radial-gradient()>|<conic-gradient()>|<repeating-conic-gradient()>|<-legacy-gradient>",
        "grayscale()": "grayscale( [<number>|<percentage>]? )",
        "grid-line": "auto|<custom-ident>|[<integer>&&<custom-ident>?]|[span&&[<integer>||<custom-ident>]]",
        "historical-lig-values": "[historical-ligatures|no-historical-ligatures]",
        "hsl()": "hsl( <hue> , <percentage> , <percentage> , <alpha-value>? )|hsl( [<hue>|none] [<percentage>|<number>|none] [<percentage>|<number>|none] [/ [<alpha-value>|none]]? )",
        "hsla()": "hsla( <hue> , <percentage> , <percentage> , <alpha-value>? )|hsla( [<hue>|none] [<percentage>|<number>|none] [<percentage>|<number>|none] [/ [<alpha-value>|none]]? )",
        "hue": "<number>|<angle>",
        "hue-interpolation-method": "[shorter|longer|increasing|decreasing] hue",
        "hue-rotate()": "hue-rotate( [<angle>|<zero>]? )",
        "hwb()": "hwb( [<hue>|none] [<percentage>|<number>|none] [<percentage>|<number>|none] [/ [<alpha-value>|none]]? )",
        "hypot()": "hypot( <calc-sum># )",
        "image": "<url>|<image()>|<image-set()>|<element()>|<paint()>|<cross-fade()>|<gradient>",
        "image()": "image( <image-tags>? [<image-src>? , <color>?]! )",
        "image-set()": "image-set( <image-set-option># )",
        "image-set-option": "[<image>|<string>] [<resolution>||type( <string> )]",
        "image-src": "<url>|<string>",
        "image-tags": "ltr|rtl",
        "inflexible-breadth": "<length-percentage>|min-content|max-content|auto",
        "inset()": "inset( <length-percentage>{1,4} [round <'border-radius'>]? )",
        "invert()": "invert( [<number>|<percentage>]? )",
        "keyframe-block": "<keyframe-selector># { <declaration-list> }",
        "keyframe-selector": "from|to|<percentage [0,100]>|<timeline-range-name> <percentage>",
        "keyframes-name": "<custom-ident>|<string>",
        "lab()": "lab( [<percentage>|<number>|none] [<percentage>|<number>|none] [<percentage>|<number>|none] [/ [<alpha-value>|none]]? )",
        "layer()": "layer( <layer-name> )",
        "layer-name": "<ident> ['.' <ident>]*",
        "lch()": "lch( [<percentage>|<number>|none] [<percentage>|<number>|none] [<hue>|none] [/ [<alpha-value>|none]]? )",
        "leader()": "leader( <leader-type> )",
        "leader-type": "dotted|solid|space|<string>",
        "length-percentage": "<length>|<percentage>",
        "light-dark()": "light-dark( <color> , <color> )",
        "line-name-list": "[<line-names>|<name-repeat>]+",
        "line-names": "'[' <custom-ident>* ']'",
        "line-style": "none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset",
        "line-width": "<length>|thin|medium|thick",
        "linear()": "linear( [<number>&&<percentage>{0,2}]# )",
        "linear-color-hint": "<length-percentage>",
        "linear-color-stop": "<color> <color-stop-length>?",
        "linear-easing-function": "linear|<linear()>",
        "linear-gradient()": "linear-gradient( [<linear-gradient-syntax>] )",
        "linear-gradient-syntax": "[[<angle>|<zero>|to <side-or-corner>]||<color-interpolation-method>]? , <color-stop-list>",
        "log()": "log( <calc-sum> , <calc-sum>? )",
        "mask-layer": "<mask-reference>||<position> [/ <bg-size>]?||<repeat-style>||<geometry-box>||[<geometry-box>|no-clip]||<compositing-operator>||<masking-mode>",
        "mask-position": "[<length-percentage>|left|center|right] [<length-percentage>|top|center|bottom]?",
        "mask-reference": "none|<image>|<mask-source>",
        "mask-source": "<url>",
        "masking-mode": "alpha|luminance|match-source",
        "matrix()": "matrix( <number>#{6} )",
        "matrix3d()": "matrix3d( <number>#{16} )",
        "max()": "max( <calc-sum># )",
        "media-and": "<media-in-parens> [and <media-in-parens>]+",
        "media-condition": "<media-not>|<media-and>|<media-or>|<media-in-parens>",
        "media-condition-without-or": "<media-not>|<media-and>|<media-in-parens>",
        "media-feature": "( [<mf-plain>|<mf-boolean>|<mf-range>] )",
        "media-in-parens": "( <media-condition> )|<media-feature>|<general-enclosed>",
        "media-not": "not <media-in-parens>",
        "media-or": "<media-in-parens> [or <media-in-parens>]+",
        "media-query": "<media-condition>|[not|only]? <media-type> [and <media-condition-without-or>]?",
        "media-query-list": "<media-query>#",
        "media-type": "<ident>",
        "mf-boolean": "<mf-name>",
        "mf-name": "<ident>",
        "mf-plain": "<mf-name> : <mf-value>",
        "mf-range": "<mf-name> ['<'|'>']? '='? <mf-value>|<mf-value> ['<'|'>']? '='? <mf-name>|<mf-value> '<' '='? <mf-name> '<' '='? <mf-value>|<mf-value> '>' '='? <mf-name> '>' '='? <mf-value>",
        "mf-value": "<number>|<dimension>|<ident>|<ratio>",
        "min()": "min( <calc-sum># )",
        "minmax()": "minmax( [<length-percentage>|min-content|max-content|auto] , [<length-percentage>|<flex>|min-content|max-content|auto] )",
        "mod()": "mod( <calc-sum> , <calc-sum> )",
        "n-dimension": "<dimension-token>",
        "name-repeat": "repeat( [<integer [1,∞]>|auto-fill] , <line-names>+ )",
        "named-color": "aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen",
        "namespace-prefix": "<ident>",
        "ndash-dimension": "<dimension-token>",
        "ndashdigit-dimension": "<dimension-token>",
        "ndashdigit-ident": "<ident-token>",
        "ns-prefix": "[<ident-token>|'*']? '|'",
        "number-percentage": "<number>|<percentage>",
        "numeric-figure-values": "[lining-nums|oldstyle-nums]",
        "numeric-fraction-values": "[diagonal-fractions|stacked-fractions]",
        "numeric-spacing-values": "[proportional-nums|tabular-nums]",
        "offset-path": "<ray()>|<url>|<basic-shape>",
        "oklab()": "oklab( [<percentage>|<number>|none] [<percentage>|<number>|none] [<percentage>|<number>|none] [/ [<alpha-value>|none]]? )",
        "oklch()": "oklch( [<percentage>|<number>|none] [<percentage>|<number>|none] [<hue>|none] [/ [<alpha-value>|none]]? )",
        "opacity()": "opacity( [<number>|<percentage>]? )",
        "opacity-value": "<number>|<percentage>",
        "outline-line-style": "none|dotted|dashed|solid|double|groove|ridge|inset|outset",
        "outline-radius": "<length>|<percentage>",
        "overflow-position": "unsafe|safe",
        "page-body": "<declaration>? [; <page-body>]?|<page-margin-box> <page-body>",
        "page-margin-box": "<page-margin-box-type> '{' <declaration-list> '}'",
        "page-margin-box-type": "@top-left-corner|@top-left|@top-center|@top-right|@top-right-corner|@bottom-left-corner|@bottom-left|@bottom-center|@bottom-right|@bottom-right-corner|@left-top|@left-middle|@left-bottom|@right-top|@right-middle|@right-bottom",
        "page-selector": "<pseudo-page>+|<ident> <pseudo-page>*",
        "page-selector-list": "[<page-selector>#]?",
        "page-size": "A5|A4|A3|B5|B4|JIS-B5|JIS-B4|letter|legal|ledger",
        "paint": "none|<color>|<url> [none|<color>]?|context-fill|context-stroke",
        "paint()": "paint( <ident> , <declaration-value>? )",
        "paint-box": "<visual-box>|fill-box|stroke-box",
        "palette-identifier": "<dashed-ident>",
        "palette-mix()": "palette-mix( <color-interpolation-method> , [[normal|light|dark|<palette-identifier>|<palette-mix()>]&&<percentage [0,100]>?]#{2} )",
        "path()": "path( <'fill-rule'>? , <string> )",
        "perspective()": "perspective( [<length [0,∞]>|none] )",
        "polar-color-space": "hsl|hwb|lch|oklch",
        "polygon()": "polygon( <'fill-rule'>? , [<length-percentage> <length-percentage>]# )",
        "position": "[[left|center|right]||[top|center|bottom]|[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]?|[[left|right] <length-percentage>]&&[[top|bottom] <length-percentage>]]",
        "position-area": "[[left|center|right|span-left|span-right|x-start|x-end|span-x-start|span-x-end|x-self-start|x-self-end|span-x-self-start|span-x-self-end|span-all]||[top|center|bottom|span-top|span-bottom|y-start|y-end|span-y-start|span-y-end|y-self-start|y-self-end|span-y-self-start|span-y-self-end|span-all]|[block-start|center|block-end|span-block-start|span-block-end|span-all]||[inline-start|center|inline-end|span-inline-start|span-inline-end|span-all]|[self-block-start|center|self-block-end|span-self-block-start|span-self-block-end|span-all]||[self-inline-start|center|self-inline-end|span-self-inline-start|span-self-inline-end|span-all]|[start|center|end|span-start|span-end|span-all]{1,2}|[self-start|center|self-end|span-self-start|span-self-end|span-all]{1,2}]",
        "pow()": "pow( <calc-sum> , <calc-sum> )",
        "predefined-rgb": "srgb|srgb-linear|display-p3|display-p3-linear|a98-rgb|prophoto-rgb|rec2020",
        "predefined-rgb-params": "<predefined-rgb> [<number>|<percentage>|none]{3}",
        "pseudo-class-selector": "':' <ident-token>|':' <function-token> <any-value> ')'",
        "pseudo-element-selector": "':' <pseudo-class-selector>|<legacy-pseudo-element-selector>",
        "pseudo-page": ": [left|right|first|blank]",
        "query-in-parens": "( <container-condition> )|( <size-feature> )|style( <style-query> )|<general-enclosed>",
        "quote": "open-quote|close-quote|no-open-quote|no-close-quote",
        "radial-extent": "closest-corner|closest-side|farthest-corner|farthest-side",
        "radial-gradient()": "radial-gradient( [<radial-gradient-syntax>] )",
        "radial-gradient-syntax": "[[[<radial-shape>||<radial-size>]? [at <position>]?]||<color-interpolation-method>]? , <color-stop-list>",
        "radial-shape": "circle|ellipse",
        "radial-size": "<radial-extent>|<length [0,∞]>|<length-percentage [0,∞]>{2}",
        "ratio": "<number [0,∞]> [/ <number [0,∞]>]?",
        "ray()": "ray( <angle>&&<ray-size>?&&contain?&&[at <position>]? )",
        "ray-size": "closest-side|closest-corner|farthest-side|farthest-corner|sides",
        "rect()": "rect( [<length-percentage>|auto]{4} [round <'border-radius'>]? )",
        "rectangular-color-space": "srgb|srgb-linear|display-p3|display-p3-linear|a98-rgb|prophoto-rgb|rec2020|lab|oklab|xyz|xyz-d50|xyz-d65",
        "relative-selector": "<combinator>? <complex-selector>",
        "relative-selector-list": "<relative-selector>#",
        "relative-size": "larger|smaller",
        "rem()": "rem( <calc-sum> , <calc-sum> )",
        "repeat-style": "repeat-x|repeat-y|[repeat|space|round|no-repeat]{1,2}",
        "repeating-conic-gradient()": "repeating-conic-gradient( [<conic-gradient-syntax>] )",
        "repeating-linear-gradient()": "repeating-linear-gradient( [<linear-gradient-syntax>] )",
        "repeating-radial-gradient()": "repeating-radial-gradient( [<radial-gradient-syntax>] )",
        "reversed-counter-name": "reversed( <counter-name> )",
        "rgb()": "rgb( <percentage>#{3} , <alpha-value>? )|rgb( <number>#{3} , <alpha-value>? )|rgb( [<number>|<percentage>|none]{3} [/ [<alpha-value>|none]]? )",
        "rgba()": "rgba( <percentage>#{3} , <alpha-value>? )|rgba( <number>#{3} , <alpha-value>? )|rgba( [<number>|<percentage>|none]{3} [/ [<alpha-value>|none]]? )",
        "rotate()": "rotate( [<angle>|<zero>] )",
        "rotate3d()": "rotate3d( <number> , <number> , <number> , [<angle>|<zero>] )",
        "rotateX()": "rotateX( [<angle>|<zero>] )",
        "rotateY()": "rotateY( [<angle>|<zero>] )",
        "rotateZ()": "rotateZ( [<angle>|<zero>] )",
        "round()": "round( <rounding-strategy>? , <calc-sum> , <calc-sum> )",
        "rounding-strategy": "nearest|up|down|to-zero",
        "saturate()": "saturate( [<number>|<percentage>]? )",
        "scale()": "scale( [<number>|<percentage>]#{1,2} )",
        "scale3d()": "scale3d( [<number>|<percentage>]#{3} )",
        "scaleX()": "scaleX( [<number>|<percentage>] )",
        "scaleY()": "scaleY( [<number>|<percentage>] )",
        "scaleZ()": "scaleZ( [<number>|<percentage>] )",
        "scope-end": "<forgiving-selector-list>",
        "scope-start": "<forgiving-selector-list>",
        "scroll()": "scroll( [<scroller>||<axis>]? )",
        "scroller": "root|nearest|self",
        "scroll-state-feature": "<media-query-list>",
        "scroll-state-in-parens": "( <scroll-state-query> )|( <scroll-state-feature> )|<general-enclosed>",
        "scroll-state-query": "not <scroll-state-in-parens>|<scroll-state-in-parens> [[and <scroll-state-in-parens>]*|[or <scroll-state-in-parens>]*]|<scroll-state-feature>",
        "selector-list": "<complex-selector-list>",
        "self-position": "center|start|end|self-start|self-end|flex-start|flex-end",
        "sepia()": "sepia( [<number>|<percentage>]? )",
        "shadow": "inset?&&<length>{2,4}&&<color>?",
        "shadow-t": "[<length>{2,3}&&<color>?]",
        "shape": "rect( <top> , <right> , <bottom> , <left> )|rect( <top> <right> <bottom> <left> )",
        "shape-box": "<visual-box>|margin-box",
        "side-or-corner": "[left|right]||[top|bottom]",
        "sign()": "sign( <calc-sum> )",
        "signed-integer": "<number-token>",
        "signless-integer": "<number-token>",
        "sin()": "sin( <calc-sum> )",
        "single-animation": "<'animation-duration'>||<easing-function>||<'animation-delay'>||<single-animation-iteration-count>||<single-animation-direction>||<single-animation-fill-mode>||<single-animation-play-state>||[none|<keyframes-name>]||<single-animation-timeline>",
        "single-animation-composition": "replace|add|accumulate",
        "single-animation-direction": "normal|reverse|alternate|alternate-reverse",
        "single-animation-fill-mode": "none|forwards|backwards|both",
        "single-animation-iteration-count": "infinite|<number>",
        "single-animation-play-state": "running|paused",
        "single-animation-timeline": "auto|none|<dashed-ident>|<scroll()>|<view()>",
        "single-transition": "[none|<single-transition-property>]||<time>||<easing-function>||<time>||<transition-behavior-value>",
        "single-transition-property": "all|<custom-ident>",
        "size": "closest-side|farthest-side|closest-corner|farthest-corner|<length>|<length-percentage>{2}",
        "size-feature": "<mf-plain>|<mf-boolean>|<mf-range>",
        "skew()": "skew( [<angle>|<zero>] , [<angle>|<zero>]? )",
        "skewX()": "skewX( [<angle>|<zero>] )",
        "skewY()": "skewY( [<angle>|<zero>] )",
        "sqrt()": "sqrt( <calc-sum> )",
        "step-position": "jump-start|jump-end|jump-none|jump-both|start|end",
        "step-easing-function": "step-start|step-end|<steps()>",
        "steps()": "steps( <integer> , <step-position>? )",
        "style-feature": "<declaration>",
        "style-in-parens": "( <style-condition> )|( <style-feature> )|<general-enclosed>",
        "style-query": "<style-condition>|<style-feature>",
        "subclass-selector": "<id-selector>|<class-selector>|<attribute-selector>|<pseudo-class-selector>",
        "superellipse()": "superellipse( [<number>|infinity|-infinity] )",
        "supports-condition": "not <supports-in-parens>|<supports-in-parens> [and <supports-in-parens>]*|<supports-in-parens> [or <supports-in-parens>]*",
        "supports-decl": "( <declaration> )",
        "supports-feature": "<supports-decl>|<supports-selector-fn>",
        "supports-in-parens": "( <supports-condition> )|<supports-feature>|<general-enclosed>",
        "supports-selector-fn": "selector( <complex-selector> )",
        "symbol": "<string>|<image>|<custom-ident>",
        "symbols()": "symbols( <symbols-type>? [<string>|<image>]+ )",
        "symbols-type": "cyclic|numeric|alphabetic|symbolic|fixed",
        "system-color": "AccentColor|AccentColorText|ActiveText|ButtonBorder|ButtonFace|ButtonText|Canvas|CanvasText|Field|FieldText|GrayText|Highlight|HighlightText|LinkText|Mark|MarkText|SelectedItem|SelectedItemText|VisitedText",
        "system-family-name": "caption|icon|menu|message-box|small-caption|status-bar",
        "tan()": "tan( <calc-sum> )",
        "target": "<target-counter()>|<target-counters()>|<target-text()>",
        "target-counter()": "target-counter( [<string>|<url>] , <custom-ident> , <counter-style>? )",
        "target-counters()": "target-counters( [<string>|<url>] , <custom-ident> , <string> , <counter-style>? )",
        "target-text()": "target-text( [<string>|<url>] , [content|before|after|first-letter]? )",
        "text-edge": "[text|cap|ex|ideographic|ideographic-ink] [text|alphabetic|ideographic|ideographic-ink]?",
        "time-percentage": "<time>|<percentage>",
        "timeline-range-name": "cover|contain|entry|exit|entry-crossing|exit-crossing",
        "track-breadth": "<length-percentage>|<flex>|min-content|max-content|auto",
        "track-list": "[<line-names>? [<track-size>|<track-repeat>]]+ <line-names>?",
        "track-repeat": "repeat( [<integer [1,∞]>] , [<line-names>? <track-size>]+ <line-names>? )",
        "track-size": "<track-breadth>|minmax( <inflexible-breadth> , <track-breadth> )|fit-content( <length-percentage> )",
        "transform-function": "<matrix()>|<translate()>|<translateX()>|<translateY()>|<scale()>|<scaleX()>|<scaleY()>|<rotate()>|<skew()>|<skewX()>|<skewY()>|<matrix3d()>|<translate3d()>|<translateZ()>|<scale3d()>|<scaleZ()>|<rotate3d()>|<rotateX()>|<rotateY()>|<rotateZ()>|<perspective()>",
        "transform-list": "<transform-function>+",
        "transition-behavior-value": "normal|allow-discrete",
        "translate()": "translate( <length-percentage> , <length-percentage>? )",
        "translate3d()": "translate3d( <length-percentage> , <length-percentage> , <length> )",
        "translateX()": "translateX( <length-percentage> )",
        "translateY()": "translateY( <length-percentage> )",
        "translateZ()": "translateZ( <length> )",
        "try-size": "most-width|most-height|most-block-size|most-inline-size",
        "try-tactic": "flip-block||flip-inline||flip-start",
        "type-or-unit": "string|color|url|integer|number|length|angle|time|frequency|cap|ch|em|ex|ic|lh|rlh|rem|vb|vi|vw|vh|vmin|vmax|mm|Q|cm|in|pt|pc|px|deg|grad|rad|turn|ms|s|Hz|kHz|%",
        "type-selector": "<wq-name>|<ns-prefix>? '*'",
        "var()": "var( <custom-property-name> , <declaration-value>? )",
        "view()": "view( [<axis>||<'view-timeline-inset'>]? )",
        "viewport-length": "auto|<length-percentage>",
        "visual-box": "content-box|padding-box|border-box",
        "wq-name": "<ns-prefix>? <ident-token>",
        "xywh()": "xywh( <length-percentage>{2} <length-percentage [0,∞]>{2} [round <'border-radius'>]? )",
        "xyz": "xyz|xyz-d50|xyz-d65",
        "xyz-params": "<xyz-space> [<number>|<percentage>|none]{3}",
        "-legacy-gradient": "<-webkit-gradient()>|<-legacy-linear-gradient>|<-legacy-repeating-linear-gradient>|<-legacy-radial-gradient>|<-legacy-repeating-radial-gradient>",
        "-legacy-linear-gradient": "-moz-linear-gradient( <-legacy-linear-gradient-arguments> )|-webkit-linear-gradient( <-legacy-linear-gradient-arguments> )|-o-linear-gradient( <-legacy-linear-gradient-arguments> )",
        "-legacy-repeating-linear-gradient": "-moz-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )|-webkit-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )|-o-repeating-linear-gradient( <-legacy-linear-gradient-arguments> )",
        "-legacy-linear-gradient-arguments": "[<angle>|<side-or-corner>]? , <color-stop-list>",
        "-legacy-radial-gradient": "-moz-radial-gradient( <-legacy-radial-gradient-arguments> )|-webkit-radial-gradient( <-legacy-radial-gradient-arguments> )|-o-radial-gradient( <-legacy-radial-gradient-arguments> )",
        "-legacy-repeating-radial-gradient": "-moz-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )|-webkit-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )|-o-repeating-radial-gradient( <-legacy-radial-gradient-arguments> )",
        "-legacy-radial-gradient-arguments": "[<position> ,]? [[[<-legacy-radial-gradient-shape>||<-legacy-radial-gradient-size>]|[<length>|<percentage>]{2}] ,]? <color-stop-list>",
        "-legacy-radial-gradient-size": "closest-side|closest-corner|farthest-side|farthest-corner|contain|cover",
        "-legacy-radial-gradient-shape": "circle|ellipse",
        "-non-standard-font": "-apple-system-body|-apple-system-headline|-apple-system-subheadline|-apple-system-caption1|-apple-system-caption2|-apple-system-footnote|-apple-system-short-body|-apple-system-short-headline|-apple-system-short-subheadline|-apple-system-short-caption1|-apple-system-short-footnote|-apple-system-tall-body",
        "-non-standard-color": "-moz-ButtonDefault|-moz-ButtonHoverFace|-moz-ButtonHoverText|-moz-CellHighlight|-moz-CellHighlightText|-moz-Combobox|-moz-ComboboxText|-moz-Dialog|-moz-DialogText|-moz-dragtargetzone|-moz-EvenTreeRow|-moz-Field|-moz-FieldText|-moz-html-CellHighlight|-moz-html-CellHighlightText|-moz-mac-accentdarkestshadow|-moz-mac-accentdarkshadow|-moz-mac-accentface|-moz-mac-accentlightesthighlight|-moz-mac-accentlightshadow|-moz-mac-accentregularhighlight|-moz-mac-accentregularshadow|-moz-mac-chrome-active|-moz-mac-chrome-inactive|-moz-mac-focusring|-moz-mac-menuselect|-moz-mac-menushadow|-moz-mac-menutextselect|-moz-MenuHover|-moz-MenuHoverText|-moz-MenuBarText|-moz-MenuBarHoverText|-moz-nativehyperlinktext|-moz-OddTreeRow|-moz-win-communicationstext|-moz-win-mediatext|-moz-activehyperlinktext|-moz-default-background-color|-moz-default-color|-moz-hyperlinktext|-moz-visitedhyperlinktext|-webkit-activelink|-webkit-focus-ring-color|-webkit-link|-webkit-text",
        "-non-standard-image-rendering": "optimize-contrast|-moz-crisp-edges|-o-crisp-edges|-webkit-optimize-contrast",
        "-non-standard-overflow": "overlay|-moz-scrollbars-none|-moz-scrollbars-horizontal|-moz-scrollbars-vertical|-moz-hidden-unscrollable",
        "-non-standard-size": "intrinsic|min-intrinsic|-webkit-fill-available|-webkit-fit-content|-webkit-min-content|-webkit-max-content|-moz-available|-moz-fit-content|-moz-min-content|-moz-max-content",
        "-webkit-gradient()": "-webkit-gradient( <-webkit-gradient-type> , <-webkit-gradient-point> [, <-webkit-gradient-point>|, <-webkit-gradient-radius> , <-webkit-gradient-point>] [, <-webkit-gradient-radius>]? [, <-webkit-gradient-color-stop>]* )",
        "-webkit-gradient-color-stop": "from( <color> )|color-stop( [<number-zero-one>|<percentage>] , <color> )|to( <color> )",
        "-webkit-gradient-point": "[left|center|right|<length-percentage>] [top|center|bottom|<length-percentage>]",
        "-webkit-gradient-radius": "<length>|<percentage>",
        "-webkit-gradient-type": "linear|radial",
        "-webkit-mask-box-repeat": "repeat|stretch|round",
        "-ms-filter-function-list": "<-ms-filter-function>+",
        "-ms-filter-function": "<-ms-filter-function-progid>|<-ms-filter-function-legacy>",
        "-ms-filter-function-progid": "'progid:' [<ident-token> '.']* [<ident-token>|<function-token> <any-value>? )]",
        "-ms-filter-function-legacy": "<ident-token>|<function-token> <any-value>? )",
        "age": "child|young|old",
        "attr-name": "<wq-name>",
        "attr-fallback": "<any-value>",
        "autospace": "no-autospace|[ideograph-alpha||ideograph-numeric||punctuation]||[insert|replace]",
        "bottom": "<length>|auto",
        "generic-voice": "[<age>? <gender> <integer>?]",
        "gender": "male|female|neutral",
        "generic-script-specific": "generic( kai )|generic( fangsong )|generic( nastaliq )",
        "-non-standard-generic-family": "-apple-system|BlinkMacSystemFont",
        "intrinsic-size-keyword": "min-content|max-content|fit-content",
        "left": "<length>|auto",
        "device-cmyk()": "<legacy-device-cmyk-syntax>|<modern-device-cmyk-syntax>",
        "legacy-device-cmyk-syntax": "device-cmyk( <number>#{4} )",
        "modern-device-cmyk-syntax": "device-cmyk( <cmyk-component>{4} [/ [<alpha-value>|none]]? )",
        "cmyk-component": "<number>|<percentage>|none",
        "color-space": "<rectangular-color-space>|<polar-color-space>|<custom-color-space>",
        "right": "<length>|auto",
        "forgiving-selector-list": "<complex-real-selector-list>",
        "forgiving-relative-selector-list": "<relative-real-selector-list>",
        "complex-real-selector-list": "<complex-real-selector>#",
        "simple-selector-list": "<simple-selector>#",
        "relative-real-selector-list": "<relative-real-selector>#",
        "complex-selector-unit": "[<compound-selector>? <pseudo-compound-selector>*]!",
        "complex-real-selector": "<compound-selector> [<combinator>? <compound-selector>]*",
        "relative-real-selector": "<combinator>? <complex-real-selector>",
        "pseudo-compound-selector": "<pseudo-element-selector> <pseudo-class-selector>*",
        "simple-selector": "<type-selector>|<subclass-selector>",
        "legacy-pseudo-element-selector": "':' [before|after|first-line|first-letter]",
        "svg-length": "<percentage>|<length>|<number>",
        "svg-writing-mode": "lr-tb|rl-tb|tb-rl|lr|rl|tb",
        "top": "<length>|auto",
        "x": "<number>",
        "y": "<number>",
        "declaration": "<ident-token> : <declaration-value>? ['!' important]?",
        "declaration-list": "[<declaration>? ';']* <declaration>?",
        "url": "url( <string> <url-modifier>* )|<url-token>",
        "url-modifier": "<ident>|<function-token> <any-value> )",
        "number-zero-one": "<number [0,1]>",
        "number-one-or-greater": "<number [1,∞]>",
        "xyz-space": "xyz|xyz-d50|xyz-d65",
        "style-condition": "not <style-in-parens>|<style-in-parens> [[and <style-in-parens>]*|[or <style-in-parens>]*]",
        "-non-standard-display": "-ms-inline-flexbox|-ms-grid|-ms-inline-grid|-webkit-flex|-webkit-inline-flex|-webkit-box|-webkit-inline-box|-moz-inline-stack|-moz-box|-moz-inline-box",
        "inset-area": "[[left|center|right|span-left|span-right|x-start|x-end|span-x-start|span-x-end|x-self-start|x-self-end|span-x-self-start|span-x-self-end|span-all]||[top|center|bottom|span-top|span-bottom|y-start|y-end|span-y-start|span-y-end|y-self-start|y-self-end|span-y-self-start|span-y-self-end|span-all]|[block-start|center|block-end|span-block-start|span-block-end|span-all]||[inline-start|center|inline-end|span-inline-start|span-inline-end|span-all]|[self-block-start|self-block-end|span-self-block-start|span-self-block-end|span-all]||[self-inline-start|self-inline-end|span-self-inline-start|span-self-inline-end|span-all]|[start|center|end|span-start|span-end|span-all]{1,2}|[self-start|center|self-end|span-self-start|span-self-end|span-all]{1,2}]",
        "syntax": "'*'|<syntax-component> [<syntax-combinator> <syntax-component>]*|<syntax-string>",
        "syntax-component": "<syntax-single-component> <syntax-multiplier>?|'<' transform-list '>'",
        "syntax-single-component": "'<' <syntax-type-name> '>'|<ident>",
        "syntax-type-name": "angle|color|custom-ident|image|integer|length|length-percentage|number|percentage|resolution|string|time|url|transform-function",
        "syntax-combinator": "'|'",
        "syntax-multiplier": "'#'|'+'",
        "syntax-string": "<string>"
    },
    "properties": {
        "--*": "<declaration-value>",
        "-ms-accelerator": "false|true",
        "-ms-block-progression": "tb|rl|bt|lr",
        "-ms-content-zoom-chaining": "none|chained",
        "-ms-content-zoom-limit": "<'-ms-content-zoom-limit-min'> <'-ms-content-zoom-limit-max'>",
        "-ms-content-zoom-limit-max": "<percentage>",
        "-ms-content-zoom-limit-min": "<percentage>",
        "-ms-content-zoom-snap": "<'-ms-content-zoom-snap-type'>||<'-ms-content-zoom-snap-points'>",
        "-ms-content-zoom-snap-points": "snapInterval( <percentage> , <percentage> )|snapList( <percentage># )",
        "-ms-content-zoom-snap-type": "none|proximity|mandatory",
        "-ms-content-zooming": "none|zoom",
        "-ms-filter": "<string>",
        "-ms-flow-from": "[none|<custom-ident>]#",
        "-ms-flow-into": "[none|<custom-ident>]#",
        "-ms-grid-columns": "none|<track-list>|<auto-track-list>",
        "-ms-grid-rows": "none|<track-list>|<auto-track-list>",
        "-ms-high-contrast-adjust": "auto|none",
        "-ms-hyphenate-limit-chars": "auto|<integer>{1,3}",
        "-ms-hyphenate-limit-lines": "no-limit|<integer>",
        "-ms-hyphenate-limit-zone": "<percentage>|<length>",
        "-ms-ime-align": "auto|after",
        "-ms-overflow-style": "auto|none|scrollbar|-ms-autohiding-scrollbar",
        "-ms-scroll-chaining": "chained|none",
        "-ms-scroll-limit": "<'-ms-scroll-limit-x-min'> <'-ms-scroll-limit-y-min'> <'-ms-scroll-limit-x-max'> <'-ms-scroll-limit-y-max'>",
        "-ms-scroll-limit-x-max": "auto|<length>",
        "-ms-scroll-limit-x-min": "<length>",
        "-ms-scroll-limit-y-max": "auto|<length>",
        "-ms-scroll-limit-y-min": "<length>",
        "-ms-scroll-rails": "none|railed",
        "-ms-scroll-snap-points-x": "snapInterval( <length-percentage> , <length-percentage> )|snapList( <length-percentage># )",
        "-ms-scroll-snap-points-y": "snapInterval( <length-percentage> , <length-percentage> )|snapList( <length-percentage># )",
        "-ms-scroll-snap-type": "none|proximity|mandatory",
        "-ms-scroll-snap-x": "<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-x'>",
        "-ms-scroll-snap-y": "<'-ms-scroll-snap-type'> <'-ms-scroll-snap-points-y'>",
        "-ms-scroll-translation": "none|vertical-to-horizontal",
        "-ms-scrollbar-3dlight-color": "<color>",
        "-ms-scrollbar-arrow-color": "<color>",
        "-ms-scrollbar-base-color": "<color>",
        "-ms-scrollbar-darkshadow-color": "<color>",
        "-ms-scrollbar-face-color": "<color>",
        "-ms-scrollbar-highlight-color": "<color>",
        "-ms-scrollbar-shadow-color": "<color>",
        "-ms-scrollbar-track-color": "<color>",
        "-ms-text-autospace": "none|ideograph-alpha|ideograph-numeric|ideograph-parenthesis|ideograph-space",
        "-ms-touch-select": "grippers|none",
        "-ms-user-select": "none|element|text",
        "-ms-wrap-flow": "auto|both|start|end|maximum|clear",
        "-ms-wrap-margin": "<length>",
        "-ms-wrap-through": "wrap|none",
        "-moz-appearance": "none|button|button-arrow-down|button-arrow-next|button-arrow-previous|button-arrow-up|button-bevel|button-focus|caret|checkbox|checkbox-container|checkbox-label|checkmenuitem|dualbutton|groupbox|listbox|listitem|menuarrow|menubar|menucheckbox|menuimage|menuitem|menuitemtext|menulist|menulist-button|menulist-text|menulist-textfield|menupopup|menuradio|menuseparator|meterbar|meterchunk|progressbar|progressbar-vertical|progresschunk|progresschunk-vertical|radio|radio-container|radio-label|radiomenuitem|range|range-thumb|resizer|resizerpanel|scale-horizontal|scalethumbend|scalethumb-horizontal|scalethumbstart|scalethumbtick|scalethumb-vertical|scale-vertical|scrollbarbutton-down|scrollbarbutton-left|scrollbarbutton-right|scrollbarbutton-up|scrollbarthumb-horizontal|scrollbarthumb-vertical|scrollbartrack-horizontal|scrollbartrack-vertical|searchfield|separator|sheet|spinner|spinner-downbutton|spinner-textfield|spinner-upbutton|splitter|statusbar|statusbarpanel|tab|tabpanel|tabpanels|tab-scroll-arrow-back|tab-scroll-arrow-forward|textfield|textfield-multiline|toolbar|toolbarbutton|toolbarbutton-dropdown|toolbargripper|toolbox|tooltip|treeheader|treeheadercell|treeheadersortarrow|treeitem|treeline|treetwisty|treetwistyopen|treeview|-moz-mac-unified-toolbar|-moz-win-borderless-glass|-moz-win-browsertabbar-toolbox|-moz-win-communicationstext|-moz-win-communications-toolbox|-moz-win-exclude-glass|-moz-win-glass|-moz-win-mediatext|-moz-win-media-toolbox|-moz-window-button-box|-moz-window-button-box-maximized|-moz-window-button-close|-moz-window-button-maximize|-moz-window-button-minimize|-moz-window-button-restore|-moz-window-frame-bottom|-moz-window-frame-left|-moz-window-frame-right|-moz-window-titlebar|-moz-window-titlebar-maximized",
        "-moz-binding": "<url>|none",
        "-moz-border-bottom-colors": "<color>+|none",
        "-moz-border-left-colors": "<color>+|none",
        "-moz-border-right-colors": "<color>+|none",
        "-moz-border-top-colors": "<color>+|none",
        "-moz-context-properties": "none|[fill|fill-opacity|stroke|stroke-opacity]#",
        "-moz-float-edge": "border-box|content-box|margin-box|padding-box",
        "-moz-force-broken-image-icon": "0|1",
        "-moz-orient": "inline|block|horizontal|vertical",
        "-moz-outline-radius": "<outline-radius>{1,4} [/ <outline-radius>{1,4}]?",
        "-moz-outline-radius-bottomleft": "<outline-radius>",
        "-moz-outline-radius-bottomright": "<outline-radius>",
        "-moz-outline-radius-topleft": "<outline-radius>",
        "-moz-outline-radius-topright": "<outline-radius>",
        "-moz-stack-sizing": "ignore|stretch-to-fit",
        "-moz-text-blink": "none|blink",
        "-moz-user-focus": "ignore|normal|select-after|select-before|select-menu|select-same|select-all|none",
        "-moz-user-input": "auto|none|enabled|disabled",
        "-moz-user-modify": "read-only|read-write|write-only",
        "-moz-window-dragging": "drag|no-drag",
        "-moz-window-shadow": "default|menu|tooltip|sheet|none",
        "-webkit-appearance": "none|button|button-bevel|caps-lock-indicator|caret|checkbox|default-button|inner-spin-button|listbox|listitem|media-controls-background|media-controls-fullscreen-background|media-current-time-display|media-enter-fullscreen-button|media-exit-fullscreen-button|media-fullscreen-button|media-mute-button|media-overlay-play-button|media-play-button|media-seek-back-button|media-seek-forward-button|media-slider|media-sliderthumb|media-time-remaining-display|media-toggle-closed-captions-button|media-volume-slider|media-volume-slider-container|media-volume-sliderthumb|menulist|menulist-button|menulist-text|menulist-textfield|meter|progress-bar|progress-bar-value|push-button|radio|scrollbarbutton-down|scrollbarbutton-left|scrollbarbutton-right|scrollbarbutton-up|scrollbargripper-horizontal|scrollbargripper-vertical|scrollbarthumb-horizontal|scrollbarthumb-vertical|scrollbartrack-horizontal|scrollbartrack-vertical|searchfield|searchfield-cancel-button|searchfield-decoration|searchfield-results-button|searchfield-results-decoration|slider-horizontal|slider-vertical|sliderthumb-horizontal|sliderthumb-vertical|square-button|textarea|textfield|-apple-pay-button",
        "-webkit-border-before": "<'border-width'>||<'border-style'>||<color>",
        "-webkit-border-before-color": "<color>",
        "-webkit-border-before-style": "<'border-style'>",
        "-webkit-border-before-width": "<'border-width'>",
        "-webkit-box-reflect": "[above|below|right|left]? <length>? <image>?",
        "-webkit-line-clamp": "none|<integer>",
        "-webkit-mask": "[<mask-reference>||<position> [/ <bg-size>]?||<repeat-style>||[<visual-box>|border|padding|content|text]||[<visual-box>|border|padding|content]]#",
        "-webkit-mask-attachment": "<attachment>#",
        "-webkit-mask-clip": "[<coord-box>|no-clip|border|padding|content|text]#",
        "-webkit-mask-composite": "<composite-style>#",
        "-webkit-mask-image": "<mask-reference>#",
        "-webkit-mask-origin": "[<coord-box>|border|padding|content]#",
        "-webkit-mask-position": "<position>#",
        "-webkit-mask-position-x": "[<length-percentage>|left|center|right]#",
        "-webkit-mask-position-y": "[<length-percentage>|top|center|bottom]#",
        "-webkit-mask-repeat": "<repeat-style>#",
        "-webkit-mask-repeat-x": "repeat|no-repeat|space|round",
        "-webkit-mask-repeat-y": "repeat|no-repeat|space|round",
        "-webkit-mask-size": "<bg-size>#",
        "-webkit-overflow-scrolling": "auto|touch",
        "-webkit-tap-highlight-color": "<color>",
        "-webkit-text-fill-color": "<color>",
        "-webkit-text-stroke": "<length>||<color>",
        "-webkit-text-stroke-color": "<color>",
        "-webkit-text-stroke-width": "<length>",
        "-webkit-touch-callout": "default|none",
        "-webkit-user-modify": "read-only|read-write|read-write-plaintext-only",
        "-webkit-user-select": "auto|none|text|all",
        "accent-color": "auto|<color>",
        "align-content": "normal|<baseline-position>|<content-distribution>|<overflow-position>? <content-position>",
        "align-items": "normal|stretch|<baseline-position>|[<overflow-position>? <self-position>]|anchor-center",
        "align-self": "auto|normal|stretch|<baseline-position>|<overflow-position>? <self-position>|anchor-center",
        "align-tracks": "[normal|<baseline-position>|<content-distribution>|<overflow-position>? <content-position>]#",
        "alignment-baseline": "auto|baseline|before-edge|text-before-edge|middle|central|after-edge|text-after-edge|ideographic|alphabetic|hanging|mathematical",
        "all": "initial|inherit|unset|revert|revert-layer",
        "anchor-name": "none|<dashed-ident>#",
        "anchor-scope": "none|all|<dashed-ident>#",
        "animation": "<single-animation>#",
        "animation-composition": "<single-animation-composition>#",
        "animation-delay": "<time>#",
        "animation-direction": "<single-animation-direction>#",
        "animation-duration": "[auto|<time [0s,∞]>]#",
        "animation-fill-mode": "<single-animation-fill-mode>#",
        "animation-iteration-count": "<single-animation-iteration-count>#",
        "animation-name": "[none|<keyframes-name>]#",
        "animation-play-state": "<single-animation-play-state>#",
        "animation-range": "[<'animation-range-start'> <'animation-range-end'>?]#",
        "animation-range-end": "[normal|<length-percentage>|<timeline-range-name> <length-percentage>?]#",
        "animation-range-start": "[normal|<length-percentage>|<timeline-range-name> <length-percentage>?]#",
        "animation-timeline": "<single-animation-timeline>#",
        "animation-timing-function": "<easing-function>#",
        "animation-trigger": "[none|[<dashed-ident> <animation-action>+]+]#",
        "appearance": "none|auto|<compat-auto>|<compat-special>",
        "aspect-ratio": "auto||<ratio>",
        "backdrop-filter": "none|<filter-value-list>",
        "backface-visibility": "visible|hidden",
        "background": "<bg-layer>#? , <final-bg-layer>",
        "background-attachment": "<attachment>#",
        "background-blend-mode": "<blend-mode>#",
        "background-clip": "<bg-clip>#",
        "background-color": "<color>",
        "background-image": "<bg-image>#",
        "background-origin": "<visual-box>#",
        "background-position": "<bg-position>#",
        "background-position-x": "[center|[[left|right|x-start|x-end]? <length-percentage>?]!]#",
        "background-position-y": "[center|[[top|bottom|y-start|y-end]? <length-percentage>?]!]#",
        "background-repeat": "<repeat-style>#",
        "background-size": "<bg-size>#",
        "baseline-shift": "baseline|sub|super|<svg-length>",
        "baseline-source": "auto|first|last",
        "block-size": "<'width'>",
        "border": "<line-width>||<line-style>||<color>",
        "border-block": "<'border-block-start'>",
        "border-block-color": "<'border-top-color'>{1,2}",
        "border-block-end": "<'border-top-width'>||<'border-top-style'>||<color>",
        "border-block-end-color": "<'border-top-color'>",
        "border-block-end-style": "<'border-top-style'>",
        "border-block-end-width": "<'border-top-width'>",
        "border-block-start": "<'border-top-width'>||<'border-top-style'>||<color>",
        "border-block-start-color": "<'border-top-color'>",
        "border-block-start-style": "<'border-top-style'>",
        "border-block-start-width": "<'border-top-width'>",
        "border-block-style": "<'border-top-style'>{1,2}",
        "border-block-width": "<'border-top-width'>{1,2}",
        "border-bottom": "<line-width>||<line-style>||<color>",
        "border-bottom-color": "<'border-top-color'>",
        "border-bottom-left-radius": "<length-percentage [0,∞]>{1,2}",
        "border-bottom-right-radius": "<length-percentage [0,∞]>{1,2}",
        "border-bottom-style": "<line-style>",
        "border-bottom-width": "<line-width>",
        "border-collapse": "separate|collapse",
        "border-color": "<color>{1,4}",
        "border-end-end-radius": "<'border-top-left-radius'>",
        "border-end-start-radius": "<'border-top-left-radius'>",
        "border-image": "<'border-image-source'>||<'border-image-slice'> [/ <'border-image-width'>|/ <'border-image-width'>? / <'border-image-outset'>]?||<'border-image-repeat'>",
        "border-image-outset": "[<length [0,∞]>|<number [0,∞]>]{1,4}",
        "border-image-repeat": "[stretch|repeat|round|space]{1,2}",
        "border-image-slice": "[<number [0,∞]>|<percentage [0,∞]>]{1,4}&&fill?",
        "border-image-source": "none|<image>",
        "border-image-width": "[<length-percentage [0,∞]>|<number [0,∞]>|auto]{1,4}",
        "border-inline": "<'border-block-start'>",
        "border-inline-color": "<'border-top-color'>{1,2}",
        "border-inline-end": "<'border-top-width'>||<'border-top-style'>||<color>",
        "border-inline-end-color": "<'border-top-color'>",
        "border-inline-end-style": "<'border-top-style'>",
        "border-inline-end-width": "<'border-top-width'>",
        "border-inline-start": "<'border-top-width'>||<'border-top-style'>||<color>",
        "border-inline-start-color": "<'border-top-color'>",
        "border-inline-start-style": "<'border-top-style'>",
        "border-inline-start-width": "<'border-top-width'>",
        "border-inline-style": "<'border-top-style'>{1,2}",
        "border-inline-width": "<'border-top-width'>{1,2}",
        "border-left": "<line-width>||<line-style>||<color>",
        "border-left-color": "<color>",
        "border-left-style": "<line-style>",
        "border-left-width": "<line-width>",
        "border-radius": "<length-percentage [0,∞]>{1,4} [/ <length-percentage [0,∞]>{1,4}]?",
        "border-right": "<line-width>||<line-style>||<color>",
        "border-right-color": "<color>",
        "border-right-style": "<line-style>",
        "border-right-width": "<line-width>",
        "border-spacing": "<length>{1,2}",
        "border-start-end-radius": "<'border-top-left-radius'>",
        "border-start-start-radius": "<'border-top-left-radius'>",
        "border-style": "<line-style>{1,4}",
        "border-top": "<line-width>||<line-style>||<color>",
        "border-top-color": "<color>",
        "border-top-left-radius": "<length-percentage [0,∞]>{1,2}",
        "border-top-right-radius": "<length-percentage [0,∞]>{1,2}",
        "border-top-style": "<line-style>",
        "border-top-width": "<line-width>",
        "border-width": "<line-width>{1,4}",
        "bottom": "auto|<length-percentage>|<anchor()>|<anchor-size()>",
        "box-align": "start|center|end|baseline|stretch",
        "box-decoration-break": "slice|clone",
        "box-direction": "normal|reverse|inherit",
        "box-flex": "<number>",
        "box-flex-group": "<integer>",
        "box-lines": "single|multiple",
        "box-ordinal-group": "<integer>",
        "box-orient": "horizontal|vertical|inline-axis|block-axis|inherit",
        "box-pack": "start|center|end|justify",
        "box-shadow": "none|<shadow>#",
        "box-sizing": "content-box|border-box",
        "break-after": "auto|avoid|always|all|avoid-page|page|left|right|recto|verso|avoid-column|column|avoid-region|region",
        "break-before": "auto|avoid|always|all|avoid-page|page|left|right|recto|verso|avoid-column|column|avoid-region|region",
        "break-inside": "auto|avoid|avoid-page|avoid-column|avoid-region",
        "caption-side": "top|bottom",
        "caret": "<'caret-color'>||<'caret-animation'>||<'caret-shape'>",
        "caret-animation": "auto|manual",
        "caret-color": "auto|<color>",
        "caret-shape": "auto|bar|block|underscore",
        "clear": "none|left|right|both|inline-start|inline-end",
        "clip": "<shape>|auto",
        "clip-path": "<clip-source>|[<basic-shape>||<geometry-box>]|none",
        "clip-rule": "nonzero|evenodd",
        "color": "<color>",
        "color-interpolation-filters": "auto|sRGB|linearRGB",
        "color-scheme": "normal|[light|dark|<custom-ident>]+&&only?",
        "column-count": "<integer>|auto",
        "column-fill": "auto|balance",
        "column-gap": "normal|<length-percentage>",
        "column-height": "auto|<length [0,∞]>",
        "column-rule": "<'column-rule-width'>||<'column-rule-style'>||<'column-rule-color'>",
        "column-rule-color": "<color>",
        "column-rule-style": "<'border-style'>",
        "column-rule-width": "<'border-width'>",
        "column-span": "none|all",
        "column-width": "auto|<length [0,∞]>",
        "column-wrap": "auto|nowrap|wrap",
        "columns": "[<'column-width'>||<'column-count'>] [/ <'column-height'>]?",
        "contain": "none|strict|content|[[size||inline-size]||layout||style||paint]",
        "contain-intrinsic-block-size": "auto? [none|<length>]",
        "contain-intrinsic-height": "auto? [none|<length>]",
        "contain-intrinsic-inline-size": "auto? [none|<length>]",
        "contain-intrinsic-size": "[auto? [none|<length>]]{1,2}",
        "contain-intrinsic-width": "auto? [none|<length>]",
        "container": "<'container-name'> [/ <'container-type'>]?",
        "container-name": "none|<custom-ident>+",
        "container-type": "normal||[size|inline-size]",
        "content": "normal|none|[<content-replacement>|<content-list>] [/ [<string>|<counter>|<attr()>]+]?",
        "content-visibility": "visible|auto|hidden",
        "corner-block-end-shape": "<corner-shape-value>{1,2}",
        "corner-block-start-shape": "<corner-shape-value>{1,2}",
        "corner-bottom-shape": "<corner-shape-value>{1,2}",
        "corner-bottom-left-shape": "<corner-shape-value>",
        "corner-bottom-right-shape": "<corner-shape-value>",
        "corner-end-end-shape": "<corner-shape-value>",
        "corner-end-start-shape": "<corner-shape-value>",
        "corner-inline-end-shape": "<corner-shape-value>{1,2}",
        "corner-inline-start-shape": "<corner-shape-value>{1,2}",
        "corner-left-shape": "<corner-shape-value>{1,2}",
        "corner-right-shape": "<corner-shape-value>{1,2}",
        "corner-shape": "<corner-shape-value>{1,4}",
        "corner-start-start-shape": "<corner-shape-value>",
        "corner-start-end-shape": "<corner-shape-value>",
        "corner-top-shape": "<corner-shape-value>{1,2}",
        "corner-top-left-shape": "<corner-shape-value>",
        "corner-top-right-shape": "<corner-shape-value>",
        "counter-increment": "[<counter-name> <integer>?]+|none",
        "counter-reset": "[<counter-name> <integer>?|<reversed-counter-name> <integer>?]+|none",
        "counter-set": "[<counter-name> <integer>?]+|none",
        "cursor": "[[<url> [<x> <y>]? ,]* [auto|default|none|context-menu|help|pointer|progress|wait|cell|crosshair|text|vertical-text|alias|copy|move|no-drop|not-allowed|e-resize|n-resize|ne-resize|nw-resize|s-resize|se-resize|sw-resize|w-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|col-resize|row-resize|all-scroll|zoom-in|zoom-out|grab|grabbing|hand|-webkit-grab|-webkit-grabbing|-webkit-zoom-in|-webkit-zoom-out|-moz-grab|-moz-grabbing|-moz-zoom-in|-moz-zoom-out]]",
        "cx": "<length>|<percentage>",
        "cy": "<length>|<percentage>",
        "d": "none|path( <string> )",
        "direction": "ltr|rtl",
        "display": "[<display-outside>||<display-inside>]|<display-listitem>|<display-internal>|<display-box>|<display-legacy>|<-non-standard-display>",
        "dominant-baseline": "auto|use-script|no-change|reset-size|ideographic|alphabetic|hanging|mathematical|central|middle|text-after-edge|text-before-edge",
        "dynamic-range-limit": "standard|no-limit|constrained|<dynamic-range-limit-mix()>",
        "empty-cells": "show|hide",
        "field-sizing": "content|fixed",
        "fill": "<paint>",
        "fill-opacity": "<number-zero-one>|<percentage>",
        "fill-rule": "nonzero|evenodd",
        "filter": "none|<filter-value-list>|<-ms-filter-function-list>",
        "flex": "none|[<'flex-grow'> <'flex-shrink'>?||<'flex-basis'>]",
        "flex-basis": "content|<'width'>",
        "flex-direction": "row|row-reverse|column|column-reverse",
        "flex-flow": "<'flex-direction'>||<'flex-wrap'>",
        "flex-grow": "<number>",
        "flex-shrink": "<number>",
        "flex-wrap": "nowrap|wrap|wrap-reverse",
        "float": "left|right|none|inline-start|inline-end",
        "flood-color": "<color>",
        "flood-opacity": "<'opacity'>",
        "font": "[[<'font-style'>||<font-variant-css2>||<'font-weight'>||<font-width-css3>]? <'font-size'> [/ <'line-height'>]? <'font-family'>#]|<system-family-name>|<-non-standard-font>",
        "font-family": "[<family-name>|<generic-family>]#",
        "font-feature-settings": "normal|<feature-tag-value>#",
        "font-kerning": "auto|normal|none",
        "font-language-override": "normal|<string>",
        "font-optical-sizing": "auto|none",
        "font-palette": "normal|light|dark|<palette-identifier>|<palette-mix()>",
        "font-size": "<absolute-size>|<relative-size>|<length-percentage [0,∞]>|math",
        "font-size-adjust": "none|[ex-height|cap-height|ch-width|ic-width|ic-height]? [from-font|<number>]",
        "font-smooth": "auto|never|always|<absolute-size>|<length>",
        "font-stretch": "<font-stretch-absolute>",
        "font-style": "normal|italic|oblique <angle>?",
        "font-synthesis": "none|[weight||style||small-caps||position]",
        "font-synthesis-position": "auto|none",
        "font-synthesis-small-caps": "auto|none",
        "font-synthesis-style": "auto|none",
        "font-synthesis-weight": "auto|none",
        "font-variant": "normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>||stylistic( <feature-value-name> )||historical-forms||styleset( <feature-value-name># )||character-variant( <feature-value-name># )||swash( <feature-value-name> )||ornaments( <feature-value-name> )||annotation( <feature-value-name> )||[small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps]||<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero||<east-asian-variant-values>||<east-asian-width-values>||ruby]",
        "font-variant-alternates": "normal|[stylistic( <feature-value-name> )||historical-forms||styleset( <feature-value-name># )||character-variant( <feature-value-name># )||swash( <feature-value-name> )||ornaments( <feature-value-name> )||annotation( <feature-value-name> )]",
        "font-variant-caps": "normal|small-caps|all-small-caps|petite-caps|all-petite-caps|unicase|titling-caps",
        "font-variant-east-asian": "normal|[<east-asian-variant-values>||<east-asian-width-values>||ruby]",
        "font-variant-emoji": "normal|text|emoji|unicode",
        "font-variant-ligatures": "normal|none|[<common-lig-values>||<discretionary-lig-values>||<historical-lig-values>||<contextual-alt-values>]",
        "font-variant-numeric": "normal|[<numeric-figure-values>||<numeric-spacing-values>||<numeric-fraction-values>||ordinal||slashed-zero]",
        "font-variant-position": "normal|sub|super",
        "font-variation-settings": "normal|[<string> <number>]#",
        "font-weight": "<font-weight-absolute>|bolder|lighter",
        "font-width": "normal|<percentage [0,∞]>|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded",
        "forced-color-adjust": "auto|none|preserve-parent-color",
        "gap": "<'row-gap'> <'column-gap'>?",
        "grid": "<'grid-template'>|<'grid-template-rows'> / [auto-flow&&dense?] <'grid-auto-columns'>?|[auto-flow&&dense?] <'grid-auto-rows'>? / <'grid-template-columns'>",
        "grid-area": "<grid-line> [/ <grid-line>]{0,3}",
        "grid-auto-columns": "<track-size>+",
        "grid-auto-flow": "[row|column]||dense",
        "grid-auto-rows": "<track-size>+",
        "grid-column": "<grid-line> [/ <grid-line>]?",
        "grid-column-end": "<grid-line>",
        "grid-column-gap": "<length-percentage>",
        "grid-column-start": "<grid-line>",
        "grid-gap": "<'grid-row-gap'> <'grid-column-gap'>?",
        "grid-row": "<grid-line> [/ <grid-line>]?",
        "grid-row-end": "<grid-line>",
        "grid-row-gap": "<length-percentage>",
        "grid-row-start": "<grid-line>",
        "grid-template": "none|[<'grid-template-rows'> / <'grid-template-columns'>]|[<line-names>? <string> <track-size>? <line-names>?]+ [/ <explicit-track-list>]?",
        "grid-template-areas": "none|<string>+",
        "grid-template-columns": "none|<track-list>|<auto-track-list>|subgrid <line-name-list>?",
        "grid-template-rows": "none|<track-list>|<auto-track-list>|subgrid <line-name-list>?",
        "hanging-punctuation": "none|[first||[force-end|allow-end]||last]",
        "height": "auto|<length-percentage [0,∞]>|min-content|max-content|fit-content|fit-content( <length-percentage [0,∞]> )|<calc-size()>|<anchor-size()>|stretch|<-non-standard-size>",
        "hyphenate-character": "auto|<string>",
        "hyphenate-limit-chars": "[auto|<integer>]{1,3}",
        "hyphens": "none|manual|auto",
        "image-orientation": "from-image|<angle>|[<angle>? flip]",
        "image-rendering": "auto|crisp-edges|pixelated|smooth|optimizeSpeed|optimizeQuality|<-non-standard-image-rendering>",
        "image-resolution": "[from-image||<resolution>]&&snap?",
        "ime-mode": "auto|normal|active|inactive|disabled",
        "initial-letter": "normal|[<number> <integer>?]",
        "initial-letter-align": "[auto|alphabetic|hanging|ideographic]",
        "inline-size": "<'width'>",
        "inset": "<'top'>{1,4}",
        "inset-block": "<'top'>{1,2}",
        "inset-block-end": "<'top'>",
        "inset-block-start": "<'top'>",
        "inset-inline": "<'top'>{1,2}",
        "inset-inline-end": "<'top'>",
        "inset-inline-start": "<'top'>",
        "interpolate-size": "numeric-only|allow-keywords",
        "isolation": "auto|isolate",
        "interactivity": "auto|inert",
        "interest-delay": "<'interest-delay-start'>{1,2}",
        "interest-delay-end": "normal|<time>",
        "interest-delay-start": "normal|<time>",
        "justify-content": "normal|<content-distribution>|<overflow-position>? [<content-position>|left|right]",
        "justify-items": "normal|stretch|<baseline-position>|<overflow-position>? [<self-position>|left|right]|legacy|legacy&&[left|right|center]|anchor-center",
        "justify-self": "auto|normal|stretch|<baseline-position>|<overflow-position>? [<self-position>|left|right]|anchor-center",
        "justify-tracks": "[normal|<content-distribution>|<overflow-position>? [<content-position>|left|right]]#",
        "left": "auto|<length-percentage>|<anchor()>|<anchor-size()>",
        "letter-spacing": "normal|<length-percentage>",
        "lighting-color": "<color>",
        "line-break": "auto|loose|normal|strict|anywhere",
        "line-clamp": "none|<integer>",
        "line-height": "normal|<number>|<length>|<percentage>",
        "line-height-step": "<length>",
        "list-style": "<'list-style-type'>||<'list-style-position'>||<'list-style-image'>",
        "list-style-image": "<image>|none",
        "list-style-position": "inside|outside",
        "list-style-type": "<counter-style>|<string>|none",
        "margin": "<'margin-top'>{1,4}",
        "margin-block": "<'margin-top'>{1,2}",
        "margin-block-end": "<'margin-top'>",
        "margin-block-start": "<'margin-top'>",
        "margin-bottom": "<length-percentage>|auto|<anchor-size()>",
        "margin-inline": "<'margin-top'>{1,2}",
        "margin-inline-end": "<'margin-top'>",
        "margin-inline-start": "<'margin-top'>",
        "margin-left": "<length-percentage>|auto|<anchor-size()>",
        "margin-right": "<length-percentage>|auto|<anchor-size()>",
        "margin-top": "<length-percentage>|auto|<anchor-size()>",
        "margin-trim": "none|in-flow|all",
        "marker": "none|<url>",
        "marker-end": "none|<url>",
        "marker-mid": "none|<url>",
        "marker-start": "none|<url>",
        "mask": "<mask-layer>#",
        "mask-border": "<'mask-border-source'>||<'mask-border-slice'> [/ <'mask-border-width'>? [/ <'mask-border-outset'>]?]?||<'mask-border-repeat'>||<'mask-border-mode'>",
        "mask-border-mode": "luminance|alpha",
        "mask-border-outset": "[<length>|<number>]{1,4}",
        "mask-border-repeat": "[stretch|repeat|round|space]{1,2}",
        "mask-border-slice": "<number-percentage>{1,4} fill?",
        "mask-border-source": "none|<image>",
        "mask-border-width": "[<length-percentage>|<number>|auto]{1,4}",
        "mask-clip": "[<coord-box>|no-clip]#",
        "mask-composite": "<compositing-operator>#",
        "mask-image": "<mask-reference>#",
        "mask-mode": "<masking-mode>#",
        "mask-origin": "<coord-box>#",
        "mask-position": "<position>#",
        "mask-repeat": "<repeat-style>#",
        "mask-size": "<bg-size>#",
        "mask-type": "luminance|alpha",
        "masonry-auto-flow": "[pack|next]||[definite-first|ordered]",
        "math-depth": "auto-add|add( <integer> )|<integer>",
        "math-shift": "normal|compact",
        "math-style": "normal|compact",
        "max-block-size": "<'max-width'>",
        "max-height": "none|<length-percentage [0,∞]>|min-content|max-content|fit-content|fit-content( <length-percentage [0,∞]> )|<calc-size()>|<anchor-size()>|stretch|<-non-standard-size>",
        "max-inline-size": "<'max-width'>",
        "max-lines": "none|<integer>",
        "max-width": "none|<length-percentage [0,∞]>|min-content|max-content|fit-content|fit-content( <length-percentage [0,∞]> )|<calc-size()>|<anchor-size()>|stretch|<-non-standard-size>",
        "min-block-size": "<'min-width'>",
        "min-height": "auto|<length-percentage [0,∞]>|min-content|max-content|fit-content|fit-content( <length-percentage [0,∞]> )|<calc-size()>|<anchor-size()>|stretch|<-non-standard-size>",
        "min-inline-size": "<'min-width'>",
        "min-width": "auto|<length-percentage [0,∞]>|min-content|max-content|fit-content|fit-content( <length-percentage [0,∞]> )|<calc-size()>|<anchor-size()>|stretch|<-non-standard-size>",
        "mix-blend-mode": "<blend-mode>|plus-darker|plus-lighter",
        "object-fit": "fill|contain|cover|none|scale-down",
        "object-position": "<position>",
        "object-view-box": "none|<basic-shape-rect>",
        "offset": "[<'offset-position'>? [<'offset-path'> [<'offset-distance'>||<'offset-rotate'>]?]?]! [/ <'offset-anchor'>]?",
        "offset-anchor": "auto|<position>",
        "offset-distance": "<length-percentage>",
        "offset-path": "none|<offset-path>||<coord-box>",
        "offset-position": "normal|auto|<position>",
        "offset-rotate": "[auto|reverse]||<angle>",
        "opacity": "<opacity-value>",
        "order": "<integer>",
        "orphans": "<integer>",
        "outline": "<'outline-width'>||<'outline-style'>||<'outline-color'>",
        "outline-color": "auto|<color>",
        "outline-offset": "<length>",
        "outline-style": "auto|<outline-line-style>",
        "outline-width": "<line-width>",
        "overflow": "[visible|hidden|clip|scroll|auto]{1,2}|<-non-standard-overflow>",
        "overflow-anchor": "auto|none",
        "overflow-block": "visible|hidden|clip|scroll|auto|<-non-standard-overflow>",
        "overflow-clip-box": "padding-box|content-box",
        "overflow-clip-margin": "<visual-box>||<length [0,∞]>",
        "overflow-inline": "visible|hidden|clip|scroll|auto|<-non-standard-overflow>",
        "overflow-wrap": "normal|break-word|anywhere",
        "overflow-x": "visible|hidden|clip|scroll|auto|<-non-standard-overflow>",
        "overflow-y": "visible|hidden|clip|scroll|auto|<-non-standard-overflow>",
        "overlay": "none|auto",
        "overscroll-behavior": "[contain|none|auto]{1,2}",
        "overscroll-behavior-block": "contain|none|auto",
        "overscroll-behavior-inline": "contain|none|auto",
        "overscroll-behavior-x": "contain|none|auto",
        "overscroll-behavior-y": "contain|none|auto",
        "padding": "<'padding-top'>{1,4}",
        "padding-block": "<'padding-top'>{1,2}",
        "padding-block-end": "<'padding-top'>",
        "padding-block-start": "<'padding-top'>",
        "padding-bottom": "<length-percentage [0,∞]>",
        "padding-inline": "<'padding-top'>{1,2}",
        "padding-inline-end": "<'padding-top'>",
        "padding-inline-start": "<'padding-top'>",
        "padding-left": "<length-percentage [0,∞]>",
        "padding-right": "<length-percentage [0,∞]>",
        "padding-top": "<length-percentage [0,∞]>",
        "page": "auto|<custom-ident>",
        "page-break-after": "auto|always|avoid|left|right|recto|verso",
        "page-break-before": "auto|always|avoid|left|right|recto|verso",
        "page-break-inside": "auto|avoid",
        "paint-order": "normal|[fill||stroke||markers]",
        "perspective": "none|<length>",
        "perspective-origin": "<position>",
        "place-content": "<'align-content'> <'justify-content'>?",
        "place-items": "<'align-items'> <'justify-items'>?",
        "place-self": "<'align-self'> <'justify-self'>?",
        "pointer-events": "auto|none|visiblePainted|visibleFill|visibleStroke|visible|painted|fill|stroke|all|inherit",
        "position": "static|relative|absolute|sticky|fixed|-webkit-sticky",
        "position-anchor": "auto|none|<anchor-name>",
        "position-area": "none|<position-area>",
        "position-try": "<'position-try-order'>? <'position-try-fallbacks'>",
        "position-try-fallbacks": "none|[[<dashed-ident>||<try-tactic>]|<'position-area'>]#",
        "position-try-order": "normal|<try-size>",
        "position-visibility": "always|[anchors-valid||anchors-visible||no-overflow]",
        "print-color-adjust": "economy|exact",
        "quotes": "none|auto|[<string> <string>]+",
        "r": "<length>|<percentage>",
        "reading-flow": "normal|source-order|flex-visual|flex-flow|grid-rows|grid-columns|grid-order",
        "reading-order": "<integer>",
        "resize": "none|both|horizontal|vertical|block|inline",
        "right": "auto|<length-percentage>|<anchor()>|<anchor-size()>",
        "rotate": "none|<angle>|[x|y|z|<number>{3}]&&<angle>",
        "row-gap": "normal|<length-percentage>",
        "ruby-align": "start|center|space-between|space-around",
        "ruby-merge": "separate|collapse|auto",
        "ruby-overhang": "auto|none",
        "ruby-position": "[alternate||[over|under]]|inter-character",
        "rx": "<length>|<percentage>",
        "ry": "<length>|<percentage>",
        "scale": "none|[<number>|<percentage>]{1,3}",
        "scroll-behavior": "auto|smooth",
        "scroll-initial-target": "none|nearest",
        "scroll-margin": "<length>{1,4}",
        "scroll-margin-block": "<length>{1,2}",
        "scroll-margin-block-end": "<length>",
        "scroll-margin-block-start": "<length>",
        "scroll-margin-bottom": "<length>",
        "scroll-margin-inline": "<length>{1,2}",
        "scroll-margin-inline-end": "<length>",
        "scroll-margin-inline-start": "<length>",
        "scroll-margin-left": "<length>",
        "scroll-margin-right": "<length>",
        "scroll-margin-top": "<length>",
        "scroll-marker-group": "none|before|after",
        "scroll-padding": "[auto|<length-percentage>]{1,4}",
        "scroll-padding-block": "[auto|<length-percentage>]{1,2}",
        "scroll-padding-block-end": "auto|<length-percentage>",
        "scroll-padding-block-start": "auto|<length-percentage>",
        "scroll-padding-bottom": "auto|<length-percentage>",
        "scroll-padding-inline": "[auto|<length-percentage>]{1,2}",
        "scroll-padding-inline-end": "auto|<length-percentage>",
        "scroll-padding-inline-start": "auto|<length-percentage>",
        "scroll-padding-left": "auto|<length-percentage>",
        "scroll-padding-right": "auto|<length-percentage>",
        "scroll-padding-top": "auto|<length-percentage>",
        "scroll-snap-align": "[none|start|end|center]{1,2}",
        "scroll-snap-coordinate": "none|<position>#",
        "scroll-snap-destination": "<position>",
        "scroll-snap-points-x": "none|repeat( <length-percentage> )",
        "scroll-snap-points-y": "none|repeat( <length-percentage> )",
        "scroll-snap-stop": "normal|always",
        "scroll-snap-type": "none|[x|y|block|inline|both] [mandatory|proximity]?",
        "scroll-snap-type-x": "none|mandatory|proximity",
        "scroll-snap-type-y": "none|mandatory|proximity",
        "scroll-target-group": "none|auto",
        "scroll-timeline": "[<'scroll-timeline-name'> <'scroll-timeline-axis'>?]#",
        "scroll-timeline-axis": "[block|inline|x|y]#",
        "scroll-timeline-name": "[none|<dashed-ident>]#",
        "scrollbar-color": "auto|<color>{2}",
        "scrollbar-gutter": "auto|stable&&both-edges?",
        "scrollbar-width": "auto|thin|none",
        "shape-image-threshold": "<opacity-value>",
        "shape-margin": "<length-percentage>",
        "shape-outside": "none|[<shape-box>||<basic-shape>]|<image>",
        "shape-rendering": "auto|optimizeSpeed|crispEdges|geometricPrecision",
        "speak-as": "normal|spell-out||digits||[literal-punctuation|no-punctuation]",
        "stop-color": "<'color'>",
        "stop-opacity": "<'opacity'>",
        "stroke": "<paint>",
        "stroke-color": "<color>",
        "stroke-dasharray": "none|[<svg-length>+]#",
        "stroke-dashoffset": "<svg-length>",
        "stroke-linecap": "butt|round|square",
        "stroke-linejoin": "miter|round|bevel",
        "stroke-miterlimit": "<number-one-or-greater>",
        "stroke-opacity": "<'opacity'>",
        "stroke-width": "<svg-length>",
        "tab-size": "<integer>|<length>",
        "table-layout": "auto|fixed",
        "text-align": "start|end|left|right|center|justify|match-parent",
        "text-align-last": "auto|start|end|left|right|center|justify",
        "text-anchor": "start|middle|end",
        "text-autospace": "normal|<autospace>|auto",
        "text-box": "normal|<'text-box-trim'>||<'text-box-edge'>",
        "text-box-edge": "auto|<text-edge>",
        "text-box-trim": "none|trim-start|trim-end|trim-both",
        "text-combine-upright": "none|all|[digits <integer>?]",
        "text-decoration": "<'text-decoration-line'>||<'text-decoration-style'>||<'text-decoration-color'>||<'text-decoration-thickness'>",
        "text-decoration-color": "<color>",
        "text-decoration-inset": "<length>{1,2}|auto",
        "text-decoration-line": "none|[underline||overline||line-through||blink]|spelling-error|grammar-error",
        "text-decoration-skip": "none|[objects||[spaces|[leading-spaces||trailing-spaces]]||edges||box-decoration]",
        "text-decoration-skip-ink": "auto|all|none",
        "text-decoration-style": "solid|double|dotted|dashed|wavy",
        "text-decoration-thickness": "auto|from-font|<length>|<percentage>",
        "text-emphasis": "<'text-emphasis-style'>||<'text-emphasis-color'>",
        "text-emphasis-color": "<color>",
        "text-emphasis-position": "auto|[over|under]&&[right|left]?",
        "text-emphasis-style": "none|[[filled|open]||[dot|circle|double-circle|triangle|sesame]]|<string>",
        "text-indent": "<length-percentage>&&hanging?&&each-line?",
        "text-justify": "auto|inter-character|inter-word|none",
        "text-orientation": "mixed|upright|sideways",
        "text-overflow": "[clip|ellipsis|<string>]{1,2}",
        "text-rendering": "auto|optimizeSpeed|optimizeLegibility|geometricPrecision",
        "text-shadow": "none|<shadow-t>#",
        "text-size-adjust": "none|auto|<percentage>",
        "text-spacing-trim": "space-all|normal|space-first|trim-start",
        "text-transform": "none|[capitalize|uppercase|lowercase]||full-width||full-size-kana|math-auto",
        "text-underline-offset": "auto|<length>|<percentage>",
        "text-underline-position": "auto|from-font|[under||[left|right]]",
        "text-wrap": "<'text-wrap-mode'>||<'text-wrap-style'>",
        "text-wrap-mode": "wrap|nowrap",
        "text-wrap-style": "auto|balance|stable|pretty",
        "timeline-scope": "none|<dashed-ident>#",
        "timeline-trigger": "none|[<'timeline-trigger-name'> <'timeline-trigger-source'> <'timeline-trigger-range'> ['/' <'timeline-trigger-exit-range'>]?]#",
        "timeline-trigger-name": "none|<dashed-ident>#",
        "timeline-trigger-exit-range": "[<'timeline-trigger-exit-range-start'> <'timeline-trigger-exit-range-end'>?]#",
        "timeline-trigger-exit-range-end": "[auto|normal|<length-percentage>|<timeline-range-name> <length-percentage>?]#",
        "timeline-trigger-exit-range-start": "[auto|normal|<length-percentage>|<timeline-range-name> <length-percentage>?]#",
        "timeline-trigger-range": "[<'timeline-trigger-range-start'> <'timeline-trigger-range-end'>?]#",
        "timeline-trigger-range-end": "[normal|<length-percentage>|<timeline-range-name> <length-percentage>?]#",
        "timeline-trigger-range-start": "[normal|<length-percentage>|<timeline-range-name> <length-percentage>?]#",
        "timeline-trigger-source": "<single-animation-timeline>#",
        "top": "auto|<length-percentage>|<anchor()>|<anchor-size()>",
        "touch-action": "auto|none|[[pan-x|pan-left|pan-right]||[pan-y|pan-up|pan-down]||pinch-zoom]|manipulation",
        "transform": "none|<transform-list>",
        "transform-box": "content-box|border-box|fill-box|stroke-box|view-box",
        "transform-origin": "[<length-percentage>|left|center|right|top|bottom]|[[<length-percentage>|left|center|right]&&[<length-percentage>|top|center|bottom]] <length>?",
        "transform-style": "flat|preserve-3d",
        "transition": "<single-transition>#",
        "transition-behavior": "<transition-behavior-value>#",
        "transition-delay": "<time>#",
        "transition-duration": "<time>#",
        "transition-property": "none|<single-transition-property>#",
        "transition-timing-function": "<easing-function>#",
        "translate": "none|<length-percentage> [<length-percentage> <length>?]?",
        "trigger-scope": "none|all|<dashed-ident>#",
        "unicode-bidi": "normal|embed|isolate|bidi-override|isolate-override|plaintext|-moz-isolate|-moz-isolate-override|-moz-plaintext|-webkit-isolate|-webkit-isolate-override|-webkit-plaintext",
        "user-select": "auto|text|none|all",
        "vector-effect": "none|non-scaling-stroke|non-scaling-size|non-rotation|fixed-position",
        "vertical-align": "baseline|sub|super|text-top|text-bottom|middle|top|bottom|<percentage>|<length>",
        "view-timeline": "[<'view-timeline-name'> [<'view-timeline-axis'>||<'view-timeline-inset'>]?]#",
        "view-timeline-axis": "[block|inline|x|y]#",
        "view-timeline-inset": "[[auto|<length-percentage>]{1,2}]#",
        "view-timeline-name": "[none|<dashed-ident>]#",
        "view-transition-class": "none|<custom-ident>+",
        "view-transition-name": "none|<custom-ident>|match-element",
        "visibility": "visible|hidden|collapse",
        "white-space": "normal|pre|pre-wrap|pre-line|<'white-space-collapse'>||<'text-wrap-mode'>",
        "white-space-collapse": "collapse|preserve|preserve-breaks|preserve-spaces|break-spaces",
        "widows": "<integer>",
        "width": "auto|<length-percentage [0,∞]>|min-content|max-content|fit-content|fit-content( <length-percentage [0,∞]> )|<calc-size()>|<anchor-size()>|stretch|<-non-standard-size>",
        "will-change": "auto|<animateable-feature>#",
        "word-break": "normal|break-all|keep-all|break-word|auto-phrase",
        "word-spacing": "normal|<length>",
        "word-wrap": "normal|break-word",
        "writing-mode": "horizontal-tb|vertical-rl|vertical-lr|sideways-rl|sideways-lr|<svg-writing-mode>",
        "x": "<length>|<percentage>",
        "y": "<length>|<percentage>",
        "z-index": "auto|<integer>",
        "zoom": "normal|reset|<number [0,∞]>||<percentage [0,∞]>",
        "-moz-background-clip": "padding|border",
        "-moz-border-radius-bottomleft": "<'border-bottom-left-radius'>",
        "-moz-border-radius-bottomright": "<'border-bottom-right-radius'>",
        "-moz-border-radius-topleft": "<'border-top-left-radius'>",
        "-moz-border-radius-topright": "<'border-bottom-right-radius'>",
        "-moz-control-character-visibility": "visible|hidden",
        "-moz-osx-font-smoothing": "auto|grayscale",
        "-moz-user-select": "none|text|all|-moz-none",
        "-ms-flex-align": "start|end|center|baseline|stretch",
        "-ms-flex-item-align": "auto|start|end|center|baseline|stretch",
        "-ms-flex-line-pack": "start|end|center|justify|distribute|stretch",
        "-ms-flex-negative": "<'flex-shrink'>",
        "-ms-flex-pack": "start|end|center|justify|distribute",
        "-ms-flex-order": "<integer>",
        "-ms-flex-positive": "<'flex-grow'>",
        "-ms-flex-preferred-size": "<'flex-basis'>",
        "-ms-interpolation-mode": "nearest-neighbor|bicubic",
        "-ms-grid-column-align": "start|end|center|stretch",
        "-ms-grid-row-align": "start|end|center|stretch",
        "-ms-hyphenate-limit-last": "none|always|column|page|spread",
        "-webkit-background-clip": "[<visual-box>|border|padding|content|text]#",
        "-webkit-column-break-after": "always|auto|avoid",
        "-webkit-column-break-before": "always|auto|avoid",
        "-webkit-column-break-inside": "always|auto|avoid",
        "-webkit-font-smoothing": "auto|none|antialiased|subpixel-antialiased",
        "-webkit-mask-box-image": "[<url>|<gradient>|none] [<length-percentage>{4} <-webkit-mask-box-repeat>{2}]?",
        "-webkit-print-color-adjust": "economy|exact",
        "-webkit-text-security": "none|circle|disc|square",
        "-webkit-user-drag": "none|element|auto",
        "behavior": "<url>+",
        "cue": "<'cue-before'> <'cue-after'>?",
        "cue-after": "<url> <decibel>?|none",
        "cue-before": "<url> <decibel>?|none",
        "glyph-orientation-horizontal": "<angle>",
        "glyph-orientation-vertical": "<angle>",
        "kerning": "auto|<svg-length>",
        "pause": "<'pause-before'> <'pause-after'>?",
        "pause-after": "<time>|none|x-weak|weak|medium|strong|x-strong",
        "pause-before": "<time>|none|x-weak|weak|medium|strong|x-strong",
        "position-try-options": "<'position-try-fallbacks'>",
        "rest": "<'rest-before'> <'rest-after'>?",
        "rest-after": "<time>|none|x-weak|weak|medium|strong|x-strong",
        "rest-before": "<time>|none|x-weak|weak|medium|strong|x-strong",
        "speak": "auto|never|always",
        "voice-balance": "<number>|left|center|right|leftwards|rightwards",
        "voice-duration": "auto|<time>",
        "voice-family": "[[<family-name>|<generic-voice>] ,]* [<family-name>|<generic-voice>]|preserve",
        "voice-pitch": "<frequency>&&absolute|[[x-low|low|medium|high|x-high]||[<frequency>|<semitones>|<percentage>]]",
        "voice-range": "<frequency>&&absolute|[[x-low|low|medium|high|x-high]||[<frequency>|<semitones>|<percentage>]]",
        "voice-rate": "[normal|x-slow|slow|medium|fast|x-fast]||<percentage>",
        "voice-stress": "normal|strong|moderate|none|reduced",
        "voice-volume": "silent|[[x-soft|soft|medium|loud|x-loud]||<decibel>]",
        "white-space-trim": "none|discard-before||discard-after||discard-inner"
    },
    "atrules": {
        "charset": {
            "prelude": "<string>",
            "descriptors": null
        },
        "counter-style": {
            "prelude": "<counter-style-name>",
            "descriptors": {
                "additive-symbols": "[<integer [0,∞]>&&<symbol>]#",
                "fallback": "<counter-style-name>",
                "negative": "<symbol> <symbol>?",
                "pad": "<integer [0,∞]>&&<symbol>",
                "prefix": "<symbol>",
                "range": "[[<integer>|infinite]{2}]#|auto",
                "speak-as": "auto|bullets|numbers|words|spell-out|<counter-style-name>",
                "suffix": "<symbol>",
                "symbols": "<symbol>+",
                "system": "cyclic|numeric|alphabetic|symbolic|additive|[fixed <integer>?]|[extends <counter-style-name>]"
            }
        },
        "container": {
            "prelude": "[<container-name>]? <container-condition>",
            "descriptors": null
        },
        "document": {
            "prelude": "[<url>|url-prefix( <string> )|domain( <string> )|media-document( <string> )|regexp( <string> )]#",
            "descriptors": null
        },
        "font-face": {
            "prelude": null,
            "descriptors": {
                "ascent-override": "normal|<percentage>",
                "descent-override": "normal|<percentage>",
                "font-display": "auto|block|swap|fallback|optional",
                "font-family": "<family-name>",
                "font-feature-settings": "normal|<feature-tag-value>#",
                "font-stretch": "<font-stretch-absolute>{1,2}",
                "font-style": "normal|italic|oblique <angle>{0,2}",
                "font-variation-settings": "normal|[<string> <number>]#",
                "font-weight": "<font-weight-absolute>{1,2}",
                "line-gap-override": "normal|<percentage>",
                "size-adjust": "<percentage>",
                "src": "[<url> [format( <string># )]?|local( <family-name> )]#",
                "unicode-range": "<urange>#"
            }
        },
        "font-feature-values": {
            "prelude": "<family-name>#",
            "descriptors": null
        },
        "font-palette-values": {
            "prelude": "<dashed-ident>",
            "descriptors": {
                "base-palette": "light|dark|<integer [0,∞]>",
                "font-family": "<family-name>#",
                "override-colors": "[<integer [0,∞]> <color>]#"
            }
        },
        "import": {
            "prelude": "[<string>|<url>] [layer|layer( <layer-name> )]? [supports( [<supports-condition>|<declaration>] )]? <media-query-list>?",
            "descriptors": null
        },
        "keyframes": {
            "prelude": "<keyframes-name>",
            "descriptors": null
        },
        "layer": {
            "prelude": "[<layer-name>#|<layer-name>?]",
            "descriptors": null
        },
        "media": {
            "prelude": "<media-query-list>",
            "descriptors": null
        },
        "namespace": {
            "prelude": "<namespace-prefix>? [<string>|<url>]",
            "descriptors": null
        },
        "page": {
            "prelude": "<page-selector-list>",
            "descriptors": {
                "bleed": "auto|<length>",
                "marks": "none|[crop||cross]",
                "page-orientation": "upright|rotate-left|rotate-right",
                "size": "<length [0,∞]>{1,2}|auto|[<page-size>||[portrait|landscape]]"
            }
        },
        "position-try": {
            "prelude": "<dashed-ident>",
            "descriptors": {
                "top": "<'top'>",
                "left": "<'left'>",
                "bottom": "<'bottom'>",
                "right": "<'right'>",
                "inset-block-start": "<'inset-block-start'>",
                "inset-block-end": "<'inset-block-end'>",
                "inset-inline-start": "<'inset-inline-start'>",
                "inset-inline-end": "<'inset-inline-end'>",
                "inset-block": "<'inset-block'>",
                "inset-inline": "<'inset-inline'>",
                "inset": "<'inset'>",
                "margin-top": "<'margin-top'>",
                "margin-left": "<'margin-left'>",
                "margin-bottom": "<'margin-bottom'>",
                "margin-right": "<'margin-right'>",
                "margin-block-start": "<'margin-block-start'>",
                "margin-block-end": "<'margin-block-end'>",
                "margin-inline-start": "<'margin-inline-start'>",
                "margin-inline-end": "<'margin-inline-end'>",
                "margin": "<'margin'>",
                "margin-block": "<'margin-block'>",
                "margin-inline": "<'margin-inline'>",
                "width": "<'width'>",
                "height": "<'height'>",
                "min-width": "<'min-width'>",
                "min-height": "<'min-height'>",
                "max-width": "<'max-width'>",
                "max-height": "<'max-height'>",
                "block-size": "<'block-size'>",
                "inline-size": "<'inline-size'>",
                "min-block-size": "<'min-block-size'>",
                "min-inline-size": "<'min-inline-size'>",
                "max-block-size": "<'max-block-size'>",
                "max-inline-size": "<'max-inline-size'>",
                "align-self": "<'align-self'>|anchor-center",
                "justify-self": "<'justify-self'>|anchor-center"
            }
        },
        "property": {
            "prelude": "<custom-property-name>",
            "descriptors": {
                "inherits": "true|false",
                "initial-value": "<declaration-value>?",
                "syntax": "<string>"
            }
        },
        "scope": {
            "prelude": "[( <scope-start> )]? [to ( <scope-end> )]?",
            "descriptors": null
        },
        "starting-style": {
            "prelude": null,
            "descriptors": null
        },
        "supports": {
            "prelude": "<supports-condition>",
            "descriptors": null
        },
        "view-transition": {
            "prelude": null,
            "descriptors": {
                "navigation": "auto|none",
                "types": "none|<custom-ident>+"
            }
        },
        "font-features-values": {
            "prelude": "[<string>|<custom-ident>]+",
            "descriptors": {
                "font-display": "auto|block|swap|fallback|optional"
            }
        }
    }
});
;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/AnPlusB.js


const AnPlusB_PLUSSIGN = 0x002B;    // U+002B PLUS SIGN (+)
const AnPlusB_HYPHENMINUS = 0x002D; // U+002D HYPHEN-MINUS (-)
const AnPlusB_N = 0x006E;           // U+006E LATIN SMALL LETTER N (n)
const AnPlusB_DISALLOW_SIGN = true;
const AnPlusB_ALLOW_SIGN = false;

function AnPlusB_checkInteger(offset, disallowSign) {
    let pos = this.tokenStart + offset;
    const code = this.charCodeAt(pos);

    if (code === AnPlusB_PLUSSIGN || code === AnPlusB_HYPHENMINUS) {
        if (disallowSign) {
            this.error('Number sign is not allowed');
        }
        pos++;
    }

    for (; pos < this.tokenEnd; pos++) {
        if (!isDigit(this.charCodeAt(pos))) {
            this.error('Integer is expected', pos);
        }
    }
}

function checkTokenIsInteger(disallowSign) {
    return AnPlusB_checkInteger.call(this, 0, disallowSign);
}

function expectCharCode(offset, code) {
    if (!this.cmpChar(this.tokenStart + offset, code)) {
        let msg = '';

        switch (code) {
            case AnPlusB_N:
                msg = 'N is expected';
                break;
            case AnPlusB_HYPHENMINUS:
                msg = 'HyphenMinus is expected';
                break;
        }

        this.error(msg, this.tokenStart + offset);
    }
}

// ... <signed-integer>
// ... ['+' | '-'] <signless-integer>
function AnPlusB_consumeB() {
    let offset = 0;
    let sign = 0;
    let type = this.tokenType;

    while (type === (/* inlined export .WhiteSpace */13) || type === (/* inlined export .Comment */25)) {
        type = this.lookupType(++offset);
    }

    if (type !== (/* inlined export .Number */10)) {
        if (this.isDelim(AnPlusB_PLUSSIGN, offset) ||
            this.isDelim(AnPlusB_HYPHENMINUS, offset)) {
            sign = this.isDelim(AnPlusB_PLUSSIGN, offset) ? AnPlusB_PLUSSIGN : AnPlusB_HYPHENMINUS;

            do {
                type = this.lookupType(++offset);
            } while (type === (/* inlined export .WhiteSpace */13) || type === (/* inlined export .Comment */25));

            if (type !== (/* inlined export .Number */10)) {
                this.skip(offset);
                checkTokenIsInteger.call(this, AnPlusB_DISALLOW_SIGN);
            }
        } else {
            return null;
        }
    }

    if (offset > 0) {
        this.skip(offset);
    }

    if (sign === 0) {
        type = this.charCodeAt(this.tokenStart);
        if (type !== AnPlusB_PLUSSIGN && type !== AnPlusB_HYPHENMINUS) {
            this.error('Number sign is expected');
        }
    }

    checkTokenIsInteger.call(this, sign !== 0);
    return sign === AnPlusB_HYPHENMINUS ? '-' + this.consume((/* inlined export .Number */10)) : this.consume((/* inlined export .Number */10));
}

// An+B microsyntax https://www.w3.org/TR/css-syntax-3/#anb
const AnPlusB_name = 'AnPlusB';
const AnPlusB_structure = {
    a: [String, null],
    b: [String, null]
};

function AnPlusB_parse() {
    /* eslint-disable brace-style*/
    const start = this.tokenStart;
    let a = null;
    let b = null;

    // <integer>
    if (this.tokenType === (/* inlined export .Number */10)) {
        checkTokenIsInteger.call(this, AnPlusB_ALLOW_SIGN);
        b = this.consume((/* inlined export .Number */10));
    }

    // -n
    // -n <signed-integer>
    // -n ['+' | '-'] <signless-integer>
    // -n- <signless-integer>
    // <dashndashdigit-ident>
    else if (this.tokenType === (/* inlined export .Ident */1) && this.cmpChar(this.tokenStart, AnPlusB_HYPHENMINUS)) {
        a = '-1';

        expectCharCode.call(this, 1, AnPlusB_N);

        switch (this.tokenEnd - this.tokenStart) {
            // -n
            // -n <signed-integer>
            // -n ['+' | '-'] <signless-integer>
            case 2:
                this.next();
                b = AnPlusB_consumeB.call(this);
                break;

            // -n- <signless-integer>
            case 3:
                expectCharCode.call(this, 2, AnPlusB_HYPHENMINUS);

                this.next();
                this.skipSC();

                checkTokenIsInteger.call(this, AnPlusB_DISALLOW_SIGN);

                b = '-' + this.consume((/* inlined export .Number */10));
                break;

            // <dashndashdigit-ident>
            default:
                expectCharCode.call(this, 2, AnPlusB_HYPHENMINUS);
                AnPlusB_checkInteger.call(this, 3, AnPlusB_DISALLOW_SIGN);
                this.next();

                b = this.substrToCursor(start + 2);
        }
    }

    // '+'? n
    // '+'? n <signed-integer>
    // '+'? n ['+' | '-'] <signless-integer>
    // '+'? n- <signless-integer>
    // '+'? <ndashdigit-ident>
    else if (this.tokenType === (/* inlined export .Ident */1) || (this.isDelim(AnPlusB_PLUSSIGN) && this.lookupType(1) === (/* inlined export .Ident */1))) {
        let sign = 0;
        a = '1';

        // just ignore a plus
        if (this.isDelim(AnPlusB_PLUSSIGN)) {
            sign = 1;
            this.next();
        }

        expectCharCode.call(this, 0, AnPlusB_N);

        switch (this.tokenEnd - this.tokenStart) {
            // '+'? n
            // '+'? n <signed-integer>
            // '+'? n ['+' | '-'] <signless-integer>
            case 1:
                this.next();
                b = AnPlusB_consumeB.call(this);
                break;

            // '+'? n- <signless-integer>
            case 2:
                expectCharCode.call(this, 1, AnPlusB_HYPHENMINUS);

                this.next();
                this.skipSC();

                checkTokenIsInteger.call(this, AnPlusB_DISALLOW_SIGN);

                b = '-' + this.consume((/* inlined export .Number */10));
                break;

            // '+'? <ndashdigit-ident>
            default:
                expectCharCode.call(this, 1, AnPlusB_HYPHENMINUS);
                AnPlusB_checkInteger.call(this, 2, AnPlusB_DISALLOW_SIGN);
                this.next();

                b = this.substrToCursor(start + sign + 1);
        }
    }

    // <ndashdigit-dimension>
    // <ndash-dimension> <signless-integer>
    // <n-dimension>
    // <n-dimension> <signed-integer>
    // <n-dimension> ['+' | '-'] <signless-integer>
    else if (this.tokenType === (/* inlined export .Dimension */12)) {
        const code = this.charCodeAt(this.tokenStart);
        const sign = code === AnPlusB_PLUSSIGN || code === AnPlusB_HYPHENMINUS;
        let i = this.tokenStart + sign;

        for (; i < this.tokenEnd; i++) {
            if (!isDigit(this.charCodeAt(i))) {
                break;
            }
        }

        if (i === this.tokenStart + sign) {
            this.error('Integer is expected', this.tokenStart + sign);
        }

        expectCharCode.call(this, i - this.tokenStart, AnPlusB_N);
        a = this.substring(start, i);

        // <n-dimension>
        // <n-dimension> <signed-integer>
        // <n-dimension> ['+' | '-'] <signless-integer>
        if (i + 1 === this.tokenEnd) {
            this.next();
            b = AnPlusB_consumeB.call(this);
        } else {
            expectCharCode.call(this, i - this.tokenStart + 1, AnPlusB_HYPHENMINUS);

            // <ndash-dimension> <signless-integer>
            if (i + 2 === this.tokenEnd) {
                this.next();
                this.skipSC();
                checkTokenIsInteger.call(this, AnPlusB_DISALLOW_SIGN);
                b = '-' + this.consume((/* inlined export .Number */10));
            }
            // <ndashdigit-dimension>
            else {
                AnPlusB_checkInteger.call(this, i - this.tokenStart + 2, AnPlusB_DISALLOW_SIGN);
                this.next();
                b = this.substrToCursor(i + 1);
            }
        }
    } else {
        this.error();
    }

    if (a !== null && a.charCodeAt(0) === AnPlusB_PLUSSIGN) {
        a = a.substr(1);
    }

    if (b !== null && b.charCodeAt(0) === AnPlusB_PLUSSIGN) {
        b = b.substr(1);
    }

    return {
        type: 'AnPlusB',
        loc: this.getLocation(start, this.tokenStart),
        a,
        b
    };
}

function AnPlusB_generate(node) {
    if (node.a) {
        const a =
            node.a === '+1' && 'n' ||
            node.a ===  '1' && 'n' ||
            node.a === '-1' && '-n' ||
            node.a + 'n';

        if (node.b) {
            const b = node.b[0] === '-' || node.b[0] === '+'
                ? node.b
                : '+' + node.b;
            this.tokenize(a + b);
        } else {
            this.tokenize(a);
        }
    } else {
        this.tokenize(node.b);
    }
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Atrule.js


function Atrule_consumeRaw() {
    return this.Raw(this.consumeUntilLeftCurlyBracketOrSemicolon, true);
}

function isDeclarationBlockAtrule() {
    for (let offset = 1, type; type = this.lookupType(offset); offset++) {
        if (type === (/* inlined export .RightCurlyBracket */24)) {
            return true;
        }

        if (type === (/* inlined export .LeftCurlyBracket */23) ||
            type === (/* inlined export .AtKeyword */3)) {
            return false;
        }
    }

    return false;
}


const Atrule_name = 'Atrule';
const walkContext = 'atrule';
const Atrule_structure = {
    name: String,
    prelude: ['AtrulePrelude', 'Raw', null],
    block: ['Block', null]
};

function Atrule_parse(isDeclaration = false) {
    const start = this.tokenStart;
    let name;
    let nameLowerCase;
    let prelude = null;
    let block = null;

    this.eat((/* inlined export .AtKeyword */3));

    name = this.substrToCursor(start + 1);
    nameLowerCase = name.toLowerCase();
    this.skipSC();

    // parse prelude
    if (this.eof === false &&
        this.tokenType !== (/* inlined export .LeftCurlyBracket */23) &&
        this.tokenType !== (/* inlined export .Semicolon */17)) {
        if (this.parseAtrulePrelude) {
            prelude = this.parseWithFallback(this.AtrulePrelude.bind(this, name, isDeclaration), Atrule_consumeRaw);
        } else {
            prelude = Atrule_consumeRaw.call(this, this.tokenIndex);
        }

        this.skipSC();
    }

    switch (this.tokenType) {
        case (/* inlined export .Semicolon */17):
            this.next();
            break;

        case (/* inlined export .LeftCurlyBracket */23):
            if (hasOwnProperty.call(this.atrule, nameLowerCase) &&
                typeof this.atrule[nameLowerCase].block === 'function') {
                block = this.atrule[nameLowerCase].block.call(this, isDeclaration);
            } else {
                // TODO: should consume block content as Raw?
                block = this.Block(isDeclarationBlockAtrule.call(this));
            }

            break;
    }

    return {
        type: 'Atrule',
        loc: this.getLocation(start, this.tokenStart),
        name,
        prelude,
        block
    };
}

function Atrule_generate(node) {
    this.token((/* inlined export .AtKeyword */3), '@' + node.name);

    if (node.prelude !== null) {
        this.node(node.prelude);
    }

    if (node.block) {
        this.node(node.block);
    } else {
        this.token((/* inlined export .Semicolon */17), ';');
    }
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/AtrulePrelude.js


const AtrulePrelude_name = 'AtrulePrelude';
const AtrulePrelude_walkContext = 'atrulePrelude';
const AtrulePrelude_structure = {
    children: [[]]
};

function AtrulePrelude_parse(name) {
    let children = null;

    if (name !== null) {
        name = name.toLowerCase();
    }

    this.skipSC();

    if (hasOwnProperty.call(this.atrule, name) &&
        typeof this.atrule[name].prelude === 'function') {
        // custom consumer
        children = this.atrule[name].prelude.call(this);
    } else {
        // default consumer
        children = this.readSequence(this.scope.AtrulePrelude);
    }

    this.skipSC();

    if (this.eof !== true &&
        this.tokenType !== (/* inlined export .LeftCurlyBracket */23) &&
        this.tokenType !== (/* inlined export .Semicolon */17)) {
        this.error('Semicolon or block is expected');
    }

    return {
        type: 'AtrulePrelude',
        loc: this.getLocationFromList(children),
        children
    };
}

function AtrulePrelude_generate(node) {
    this.children(node);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/AttributeSelector.js


const DOLLARSIGN = 0x0024;       // U+0024 DOLLAR SIGN ($)
const AttributeSelector_ASTERISK = 0x002A;         // U+002A ASTERISK (*)
const EQUALSSIGN = 0x003D;       // U+003D EQUALS SIGN (=)
const CIRCUMFLEXACCENT = 0x005E; // U+005E (^)
const AttributeSelector_VERTICALLINE = 0x007C;     // U+007C VERTICAL LINE (|)
const TILDE = 0x007E;            // U+007E TILDE (~)

function getAttributeName() {
    if (this.eof) {
        this.error('Unexpected end of input');
    }

    const start = this.tokenStart;
    let expectIdent = false;

    if (this.isDelim(AttributeSelector_ASTERISK)) {
        expectIdent = true;
        this.next();
    } else if (!this.isDelim(AttributeSelector_VERTICALLINE)) {
        this.eat((/* inlined export .Ident */1));
    }

    if (this.isDelim(AttributeSelector_VERTICALLINE)) {
        if (this.charCodeAt(this.tokenStart + 1) !== EQUALSSIGN) {
            this.next();
            this.eat((/* inlined export .Ident */1));
        } else if (expectIdent) {
            this.error('Identifier is expected', this.tokenEnd);
        }
    } else if (expectIdent) {
        this.error('Vertical line is expected');
    }

    return {
        type: 'Identifier',
        loc: this.getLocation(start, this.tokenStart),
        name: this.substrToCursor(start)
    };
}

function getOperator() {
    const start = this.tokenStart;
    const code = this.charCodeAt(start);

    if (code !== EQUALSSIGN &&        // =
        code !== TILDE &&             // ~=
        code !== CIRCUMFLEXACCENT &&  // ^=
        code !== DOLLARSIGN &&        // $=
        code !== AttributeSelector_ASTERISK &&          // *=
        code !== AttributeSelector_VERTICALLINE         // |=
    ) {
        this.error('Attribute selector (=, ~=, ^=, $=, *=, |=) is expected');
    }

    this.next();

    if (code !== EQUALSSIGN) {
        if (!this.isDelim(EQUALSSIGN)) {
            this.error('Equal sign is expected');
        }

        this.next();
    }

    return this.substrToCursor(start);
}

// '[' <wq-name> ']'
// '[' <wq-name> <attr-matcher> [ <string-token> | <ident-token> ] <attr-modifier>? ']'
const AttributeSelector_name = 'AttributeSelector';
const AttributeSelector_structure = {
    name: 'Identifier',
    matcher: [String, null],
    value: ['String', 'Identifier', null],
    flags: [String, null]
};

function AttributeSelector_parse() {
    const start = this.tokenStart;
    let name;
    let matcher = null;
    let value = null;
    let flags = null;

    this.eat((/* inlined export .LeftSquareBracket */19));
    this.skipSC();

    name = getAttributeName.call(this);
    this.skipSC();

    if (this.tokenType !== (/* inlined export .RightSquareBracket */20)) {
        // avoid case `[name i]`
        if (this.tokenType !== (/* inlined export .Ident */1)) {
            matcher = getOperator.call(this);

            this.skipSC();

            value = this.tokenType === (/* inlined export .String */5)
                ? this.String()
                : this.Identifier();

            this.skipSC();
        }

        // attribute flags
        if (this.tokenType === (/* inlined export .Ident */1)) {
            flags = this.consume((/* inlined export .Ident */1));

            this.skipSC();
        }
    }

    this.eat((/* inlined export .RightSquareBracket */20));

    return {
        type: 'AttributeSelector',
        loc: this.getLocation(start, this.tokenStart),
        name,
        matcher,
        value,
        flags
    };
}

function AttributeSelector_generate(node) {
    this.token((/* inlined export .Delim */9), '[');
    this.node(node.name);

    if (node.matcher !== null) {
        this.tokenize(node.matcher);
        this.node(node.value);
    }

    if (node.flags !== null) {
        this.token((/* inlined export .Ident */1), node.flags);
    }

    this.token((/* inlined export .Delim */9), ']');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Block.js


const Block_AMPERSAND = 0x0026;       // U+0026 AMPERSAND (&)

function Block_consumeRaw() {
    return this.Raw(null, true);
}
function consumeRule() {
    return this.parseWithFallback(this.Rule, Block_consumeRaw);
}
function consumeRawDeclaration() {
    return this.Raw(this.consumeUntilSemicolonIncluded, true);
}
function consumeDeclaration() {
    if (this.tokenType === (/* inlined export .Semicolon */17)) {
        return consumeRawDeclaration.call(this, this.tokenIndex);
    }

    const node = this.parseWithFallback(this.Declaration, consumeRawDeclaration);

    if (this.tokenType === (/* inlined export .Semicolon */17)) {
        this.next();
    }

    return node;
}

const Block_name = 'Block';
const Block_walkContext = 'block';
const Block_structure = {
    children: [[
        'Atrule',
        'Rule',
        'Declaration'
    ]]
};

function Block_parse(isStyleBlock) {
    const consumer = isStyleBlock ? consumeDeclaration : consumeRule;
    const start = this.tokenStart;
    let children = this.createList();

    this.eat((/* inlined export .LeftCurlyBracket */23));

    scan:
    while (!this.eof) {
        switch (this.tokenType) {
            case (/* inlined export .RightCurlyBracket */24):
                break scan;

            case (/* inlined export .WhiteSpace */13):
            case (/* inlined export .Comment */25):
                this.next();
                break;

            case (/* inlined export .AtKeyword */3):
                children.push(this.parseWithFallback(this.Atrule.bind(this, isStyleBlock), Block_consumeRaw));
                break;

            default:
                if (isStyleBlock && this.isDelim(Block_AMPERSAND))  {
                    children.push(consumeRule.call(this));
                } else {
                    children.push(consumer.call(this));
                }
        }
    }

    if (!this.eof) {
        this.eat((/* inlined export .RightCurlyBracket */24));
    }

    return {
        type: 'Block',
        loc: this.getLocation(start, this.tokenStart),
        children
    };
}

function Block_generate(node) {
    this.token((/* inlined export .LeftCurlyBracket */23), '{');
    this.children(node, prev => {
        if (prev.type === 'Declaration') {
            this.token((/* inlined export .Semicolon */17), ';');
        }
    });
    this.token((/* inlined export .RightCurlyBracket */24), '}');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Brackets.js


const Brackets_name = 'Brackets';
const Brackets_structure = {
    children: [[]]
};

function Brackets_parse(readSequence, recognizer) {
    const start = this.tokenStart;
    let children = null;

    this.eat((/* inlined export .LeftSquareBracket */19));

    children = readSequence.call(this, recognizer);

    if (!this.eof) {
        this.eat((/* inlined export .RightSquareBracket */20));
    }

    return {
        type: 'Brackets',
        loc: this.getLocation(start, this.tokenStart),
        children
    };
}

function Brackets_generate(node) {
    this.token((/* inlined export .Delim */9), '[');
    this.children(node);
    this.token((/* inlined export .Delim */9), ']');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/CDC.js


const CDC_name = 'CDC';
const CDC_structure = [];

function CDC_parse() {
    const start = this.tokenStart;

    this.eat((/* inlined export .CDC */15)); // -->

    return {
        type: 'CDC',
        loc: this.getLocation(start, this.tokenStart)
    };
}

function CDC_generate() {
    this.token((/* inlined export .CDC */15), '-->');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/CDO.js


const CDO_name = 'CDO';
const CDO_structure = [];

function CDO_parse() {
    const start = this.tokenStart;

    this.eat((/* inlined export .CDO */14)); // <!--

    return {
        type: 'CDO',
        loc: this.getLocation(start, this.tokenStart)
    };
}

function CDO_generate() {
    this.token((/* inlined export .CDO */14), '<!--');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/ClassSelector.js


const FULLSTOP = 0x002E; // U+002E FULL STOP (.)

// '.' ident
const ClassSelector_name = 'ClassSelector';
const ClassSelector_structure = {
    name: String
};

function ClassSelector_parse() {
    this.eatDelim(FULLSTOP);

    return {
        type: 'ClassSelector',
        loc: this.getLocation(this.tokenStart - 1, this.tokenEnd),
        name: this.consume((/* inlined export .Ident */1))
    };
}

function ClassSelector_generate(node) {
    this.token((/* inlined export .Delim */9), '.');
    this.token((/* inlined export .Ident */1), node.name);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Combinator.js


const Combinator_PLUSSIGN = 0x002B;        // U+002B PLUS SIGN (+)
const SOLIDUS = 0x002F;         // U+002F SOLIDUS (/)
const Combinator_GREATERTHANSIGN = 0x003E; // U+003E GREATER-THAN SIGN (>)
const Combinator_TILDE = 0x007E;           // U+007E TILDE (~)

const Combinator_name = 'Combinator';
const Combinator_structure = {
    name: String
};

// + | > | ~ | /deep/
function Combinator_parse() {
    const start = this.tokenStart;
    let name;

    switch (this.tokenType) {
        case (/* inlined export .WhiteSpace */13):
            name = ' ';
            break;

        case (/* inlined export .Delim */9):
            switch (this.charCodeAt(this.tokenStart)) {
                case Combinator_GREATERTHANSIGN:
                case Combinator_PLUSSIGN:
                case Combinator_TILDE:
                    this.next();
                    break;

                case SOLIDUS:
                    this.next();
                    this.eatIdent('deep');
                    this.eatDelim(SOLIDUS);
                    break;

                default:
                    this.error('Combinator is expected');
            }

            name = this.substrToCursor(start);
            break;
    }

    return {
        type: 'Combinator',
        loc: this.getLocation(start, this.tokenStart),
        name
    };
}

function Combinator_generate(node) {
    this.tokenize(node.name);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Comment.js


const Comment_ASTERISK = 0x002A;        // U+002A ASTERISK (*)
const Comment_SOLIDUS = 0x002F;         // U+002F SOLIDUS (/)


const Comment_name = 'Comment';
const Comment_structure = {
    value: String
};

function Comment_parse() {
    const start = this.tokenStart;
    let end = this.tokenEnd;

    this.eat((/* inlined export .Comment */25));

    if ((end - start + 2) >= 2 &&
        this.charCodeAt(end - 2) === Comment_ASTERISK &&
        this.charCodeAt(end - 1) === Comment_SOLIDUS) {
        end -= 2;
    }

    return {
        type: 'Comment',
        loc: this.getLocation(start, this.tokenStart),
        value: this.substring(start + 2, end)
    };
}

function Comment_generate(node) {
    this.token((/* inlined export .Comment */25), '/*' + node.value + '*/');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Condition.js


const likelyFeatureToken = new Set([(/* inlined export .Colon */16), (/* inlined export .RightParenthesis */22), (/* inlined export .EOF */0)]);

const Condition_name = 'Condition';
const Condition_structure = {
    kind: String,
    children: [[
        'Identifier',
        'Feature',
        'FeatureFunction',
        'FeatureRange',
        'SupportsDeclaration'
    ]]
};

function featureOrRange(kind) {
    if (this.lookupTypeNonSC(1) === (/* inlined export .Ident */1) &&
        likelyFeatureToken.has(this.lookupTypeNonSC(2))) {
        return this.Feature(kind);
    }

    return this.FeatureRange(kind);
}

const parentheses = {
    media: featureOrRange,
    container: featureOrRange,
    supports() {
        return this.SupportsDeclaration();
    }
};

function Condition_parse(kind = 'media') {
    const children = this.createList();

    scan: while (!this.eof) {
        switch (this.tokenType) {
            case (/* inlined export .Comment */25):
            case (/* inlined export .WhiteSpace */13):
                this.next();
                continue;

            case (/* inlined export .Ident */1):
                children.push(this.Identifier());
                break;

            case (/* inlined export .LeftParenthesis */21): {
                let term = this.parseWithFallback(
                    () => parentheses[kind].call(this, kind),
                    () => null
                );

                if (!term) {
                    term = this.parseWithFallback(
                        () => {
                            this.eat((/* inlined export .LeftParenthesis */21));
                            const res = this.Condition(kind);
                            this.eat((/* inlined export .RightParenthesis */22));
                            return res;
                        },
                        () => {
                            return this.GeneralEnclosed(kind);
                        }
                    );
                }

                children.push(term);
                break;
            }

            case (/* inlined export .Function */2): {
                let term = this.parseWithFallback(
                    () => this.FeatureFunction(kind),
                    () => null
                );

                if (!term) {
                    term = this.GeneralEnclosed(kind);
                }

                children.push(term);
                break;
            }

            default:
                break scan;
        }
    }

    if (children.isEmpty) {
        this.error('Condition is expected');
    }

    return {
        type: 'Condition',
        loc: this.getLocationFromList(children),
        kind,
        children
    };
}

function Condition_generate(node) {
    node.children.forEach(child => {
        if (child.type === 'Condition') {
            this.token((/* inlined export .LeftParenthesis */21), '(');
            this.node(child);
            this.token((/* inlined export .RightParenthesis */22), ')');
        } else {
            this.node(child);
        }
    });
}


;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Declaration.js



const Declaration_EXCLAMATIONMARK = 0x0021; // U+0021 EXCLAMATION MARK (!)
const Declaration_NUMBERSIGN = 0x0023;      // U+0023 NUMBER SIGN (#)
const Declaration_DOLLARSIGN = 0x0024;      // U+0024 DOLLAR SIGN ($)
const Declaration_AMPERSAND = 0x0026;       // U+0026 AMPERSAND (&)
const Declaration_ASTERISK = 0x002A;        // U+002A ASTERISK (*)
const Declaration_PLUSSIGN = 0x002B;        // U+002B PLUS SIGN (+)
const Declaration_SOLIDUS = 0x002F;         // U+002F SOLIDUS (/)

function consumeValueRaw() {
    return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, true);
}

function consumeCustomPropertyRaw() {
    return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, false);
}

function consumeValue() {
    const startValueToken = this.tokenIndex;
    const value = this.Value();

    if (value.type !== 'Raw' &&
        this.eof === false &&
        this.tokenType !== (/* inlined export .Semicolon */17) &&
        this.isDelim(Declaration_EXCLAMATIONMARK) === false &&
        this.isBalanceEdge(startValueToken) === false) {
        this.error();
    }

    return value;
}

const Declaration_name = 'Declaration';
const Declaration_walkContext = 'declaration';
const Declaration_structure = {
    important: [Boolean, String],
    property: String,
    value: ['Value', 'Raw']
};

function Declaration_parse() {
    const start = this.tokenStart;
    const startToken = this.tokenIndex;
    const property = Declaration_readProperty.call(this);
    const customProperty = isCustomProperty(property);
    const parseValue = customProperty ? this.parseCustomProperty : this.parseValue;
    const consumeRaw = customProperty ? consumeCustomPropertyRaw : consumeValueRaw;
    let important = false;
    let value;

    this.skipSC();
    this.eat((/* inlined export .Colon */16));

    const valueStart = this.tokenIndex;

    if (!customProperty) {
        this.skipSC();
    }

    if (parseValue) {
        value = this.parseWithFallback(consumeValue, consumeRaw);
    } else {
        value = consumeRaw.call(this, this.tokenIndex);
    }

    if (customProperty && value.type === 'Value' && value.children.isEmpty) {
        for (let offset = valueStart - this.tokenIndex; offset <= 0; offset++) {
            if (this.lookupType(offset) === (/* inlined export .WhiteSpace */13)) {
                value.children.appendData({
                    type: 'WhiteSpace',
                    loc: null,
                    value: ' '
                });
                break;
            }
        }
    }

    if (this.isDelim(Declaration_EXCLAMATIONMARK)) {
        important = getImportant.call(this);
        this.skipSC();
    }

    // Do not include semicolon to range per spec
    // https://drafts.csswg.org/css-syntax/#declaration-diagram

    if (this.eof === false &&
        this.tokenType !== (/* inlined export .Semicolon */17) &&
        this.isBalanceEdge(startToken) === false) {
        this.error();
    }

    return {
        type: 'Declaration',
        loc: this.getLocation(start, this.tokenStart),
        important,
        property,
        value
    };
}

function Declaration_generate(node) {
    this.token((/* inlined export .Ident */1), node.property);
    this.token((/* inlined export .Colon */16), ':');
    this.node(node.value);

    if (node.important) {
        this.token((/* inlined export .Delim */9), '!');
        this.token((/* inlined export .Ident */1), node.important === true ? 'important' : node.important);
    }
}

function Declaration_readProperty() {
    const start = this.tokenStart;

    // hacks
    if (this.tokenType === (/* inlined export .Delim */9)) {
        switch (this.charCodeAt(this.tokenStart)) {
            case Declaration_ASTERISK:
            case Declaration_DOLLARSIGN:
            case Declaration_PLUSSIGN:
            case Declaration_NUMBERSIGN:
            case Declaration_AMPERSAND:
                this.next();
                break;

            // TODO: not sure we should support this hack
            case Declaration_SOLIDUS:
                this.next();
                if (this.isDelim(Declaration_SOLIDUS)) {
                    this.next();
                }
                break;
        }
    }

    if (this.tokenType === (/* inlined export .Hash */4)) {
        this.eat((/* inlined export .Hash */4));
    } else {
        this.eat((/* inlined export .Ident */1));
    }

    return this.substrToCursor(start);
}

// ! ws* important
function getImportant() {
    this.eat((/* inlined export .Delim */9));
    this.skipSC();

    const important = this.consume((/* inlined export .Ident */1));

    // store original value in case it differ from `important`
    // for better original source restoring and hacks like `!ie` support
    return important === 'important' ? true : important;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/DeclarationList.js


const DeclarationList_AMPERSAND = 0x0026;       // U+0026 AMPERSAND (&)

function DeclarationList_consumeRaw() {
    return this.Raw(this.consumeUntilSemicolonIncluded, true);
}

const DeclarationList_name = 'DeclarationList';
const DeclarationList_structure = {
    children: [[
        'Declaration',
        'Atrule',
        'Rule'
    ]]
};

function DeclarationList_parse() {
    const children = this.createList();

    scan:
    while (!this.eof) {
        switch (this.tokenType) {
            case (/* inlined export .WhiteSpace */13):
            case (/* inlined export .Comment */25):
            case (/* inlined export .Semicolon */17):
                this.next();
                break;

            case (/* inlined export .AtKeyword */3):
                children.push(this.parseWithFallback(this.Atrule.bind(this, true), DeclarationList_consumeRaw));
                break;

            default:
                if (this.isDelim(DeclarationList_AMPERSAND))  {
                    children.push(this.parseWithFallback(this.Rule, DeclarationList_consumeRaw));
                } else {
                    children.push(this.parseWithFallback(this.Declaration, DeclarationList_consumeRaw));
                }
        }
    }

    return {
        type: 'DeclarationList',
        loc: this.getLocationFromList(children),
        children
    };
}

function DeclarationList_generate(node) {
    this.children(node, prev => {
        if (prev.type === 'Declaration') {
            this.token((/* inlined export .Semicolon */17), ';');
        }
    });
}


;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Dimension.js


const Dimension_name = 'Dimension';
const Dimension_structure = {
    value: String,
    unit: String
};

function Dimension_parse() {
    const start = this.tokenStart;
    const value = this.consumeNumber((/* inlined export .Dimension */12));

    return {
        type: 'Dimension',
        loc: this.getLocation(start, this.tokenStart),
        value,
        unit: this.substring(start + value.length, this.tokenStart)
    };
}

function Dimension_generate(node) {
    this.token((/* inlined export .Dimension */12), node.value + node.unit);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Feature.js


const Feature_SOLIDUS = 0x002F;  // U+002F SOLIDUS (/)

const Feature_name = 'Feature';
const Feature_structure = {
    kind: String,
    name: String,
    value: ['Identifier', 'Number', 'Dimension', 'Ratio', 'Function', null]
};

function Feature_parse(kind) {
    const start = this.tokenStart;
    let name;
    let value = null;

    this.eat((/* inlined export .LeftParenthesis */21));
    this.skipSC();

    name = this.consume((/* inlined export .Ident */1));
    this.skipSC();

    if (this.tokenType !== (/* inlined export .RightParenthesis */22)) {
        this.eat((/* inlined export .Colon */16));
        this.skipSC();

        switch (this.tokenType) {
            case (/* inlined export .Number */10):
                if (this.lookupNonWSType(1) === (/* inlined export .Delim */9)) {
                    value = this.Ratio();
                } else {
                    value = this.Number();
                }

                break;

            case (/* inlined export .Dimension */12):
                value = this.Dimension();
                break;

            case (/* inlined export .Ident */1):
                value = this.Identifier();
                break;

            case (/* inlined export .Function */2):
                value = this.parseWithFallback(
                    () => {
                        const res = this.Function(this.readSequence, this.scope.Value);

                        this.skipSC();

                        if (this.isDelim(Feature_SOLIDUS)) {
                            this.error();
                        }

                        return res;
                    },
                    () => {
                        return this.Ratio();
                    }
                );
                break;

            default:
                this.error('Number, dimension, ratio or identifier is expected');
        }

        this.skipSC();
    }

    if (!this.eof) {
        this.eat((/* inlined export .RightParenthesis */22));
    }

    return {
        type: 'Feature',
        loc: this.getLocation(start, this.tokenStart),
        kind,
        name,
        value
    };
}

function Feature_generate(node) {
    this.token((/* inlined export .LeftParenthesis */21), '(');
    this.token((/* inlined export .Ident */1), node.name);

    if (node.value !== null) {
        this.token((/* inlined export .Colon */16), ':');
        this.node(node.value);
    }

    this.token((/* inlined export .RightParenthesis */22), ')');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/FeatureFunction.js


const FeatureFunction_name = 'FeatureFunction';
const FeatureFunction_structure = {
    kind: String,
    feature: String,
    value: ['Declaration', 'Selector']
};

function getFeatureParser(kind, name) {
    const featuresOfKind = this.features[kind] || {};
    const parser = featuresOfKind[name];

    if (typeof parser !== 'function') {
        this.error(`Unknown feature ${name}()`);
    }

    return parser;
}

function FeatureFunction_parse(kind = 'unknown') {
    const start = this.tokenStart;
    const functionName = this.consumeFunctionName();
    const valueParser = getFeatureParser.call(this, kind, functionName.toLowerCase());

    this.skipSC();

    const value = this.parseWithFallback(
        () => {
            const startValueToken = this.tokenIndex;
            const value = valueParser.call(this);

            if (this.eof === false &&
                this.isBalanceEdge(startValueToken) === false) {
                this.error();
            }

            return value;
        },
        () => this.Raw(null, false)
    );

    if (!this.eof) {
        this.eat((/* inlined export .RightParenthesis */22));
    }

    return {
        type: 'FeatureFunction',
        loc: this.getLocation(start, this.tokenStart),
        kind,
        feature: functionName,
        value
    };
}

function FeatureFunction_generate(node) {
    this.token((/* inlined export .Function */2), node.feature + '(');
    this.node(node.value);
    this.token((/* inlined export .RightParenthesis */22), ')');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/FeatureRange.js


const FeatureRange_SOLIDUS = 0x002F;         // U+002F SOLIDUS (/)
const FeatureRange_LESSTHANSIGN = 0x003C;    // U+003C LESS-THAN SIGN (<)
const FeatureRange_EQUALSSIGN = 0x003D;      // U+003D EQUALS SIGN (=)
const FeatureRange_GREATERTHANSIGN = 0x003E; // U+003E GREATER-THAN SIGN (>)

const FeatureRange_name = 'FeatureRange';
const FeatureRange_structure = {
    kind: String,
    left: ['Identifier', 'Number', 'Dimension', 'Ratio', 'Function'],
    leftComparison: String,
    middle: ['Identifier', 'Number', 'Dimension', 'Ratio', 'Function'],
    rightComparison: [String, null],
    right: ['Identifier', 'Number', 'Dimension', 'Ratio', 'Function', null]
};

function readTerm() {
    this.skipSC();

    switch (this.tokenType) {
        case (/* inlined export .Number */10):
            if (this.isDelim(FeatureRange_SOLIDUS, this.lookupOffsetNonSC(1))) {
                return this.Ratio();
            } else {
                return this.Number();
            }

        case (/* inlined export .Dimension */12):
            return this.Dimension();

        case (/* inlined export .Ident */1):
            return this.Identifier();

        case (/* inlined export .Function */2):
            return this.parseWithFallback(
                () => {
                    const res = this.Function(this.readSequence, this.scope.Value);

                    this.skipSC();

                    if (this.isDelim(FeatureRange_SOLIDUS)) {
                        this.error();
                    }

                    return res;
                },
                () => {
                    return this.Ratio();
                }
            );

        default:
            this.error('Number, dimension, ratio or identifier is expected');
    }
}

function readComparison(expectColon) {
    this.skipSC();

    if (this.isDelim(FeatureRange_LESSTHANSIGN) ||
        this.isDelim(FeatureRange_GREATERTHANSIGN)) {
        const value = this.source[this.tokenStart];

        this.next();

        if (this.isDelim(FeatureRange_EQUALSSIGN)) {
            this.next();
            return value + '=';
        }

        return value;
    }

    if (this.isDelim(FeatureRange_EQUALSSIGN)) {
        return '=';
    }

    this.error(`Expected ${expectColon ? '":", ' : ''}"<", ">", "=" or ")"`);
}

function FeatureRange_parse(kind = 'unknown') {
    const start = this.tokenStart;

    this.skipSC();
    this.eat((/* inlined export .LeftParenthesis */21));

    const left = readTerm.call(this);
    const leftComparison = readComparison.call(this, left.type === 'Identifier');
    const middle = readTerm.call(this);
    let rightComparison = null;
    let right = null;

    if (this.lookupNonWSType(0) !== (/* inlined export .RightParenthesis */22)) {
        rightComparison = readComparison.call(this);
        right = readTerm.call(this);
    }

    this.skipSC();
    this.eat((/* inlined export .RightParenthesis */22));

    return {
        type: 'FeatureRange',
        loc: this.getLocation(start, this.tokenStart),
        kind,
        left,
        leftComparison,
        middle,
        rightComparison,
        right
    };
}

function FeatureRange_generate(node) {
    this.token((/* inlined export .LeftParenthesis */21), '(');
    this.node(node.left);
    this.tokenize(node.leftComparison);
    this.node(node.middle);

    if (node.right) {
        this.tokenize(node.rightComparison);
        this.node(node.right);
    }

    this.token((/* inlined export .RightParenthesis */22), ')');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Function.js



const Function_name = 'Function';
const Function_walkContext = 'function';
const Function_structure = {
    name: String,
    children: [[]]
};

// <function-token> <sequence> )
function Function_parse(readSequence, recognizer) {
    const start = this.tokenStart;
    const name = this.consumeFunctionName();
    const nameLowerCase = name.toLowerCase();
    let children;

    children = recognizer.hasOwnProperty(nameLowerCase)
        ? recognizer[nameLowerCase].call(this, recognizer)
        : readSequence.call(this, recognizer);

    if (!this.eof) {
        this.eat((/* inlined export .RightParenthesis */22));
    }

    return {
        type: 'Function',
        loc: this.getLocation(start, this.tokenStart),
        name,
        children
    };
}

function Function_generate(node) {
    this.token((/* inlined export .Function */2), node.name + '(');
    this.children(node);
    this.token((/* inlined export .RightParenthesis */22), ')');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/GeneralEnclosed.js



const GeneralEnclosed_name = 'GeneralEnclosed';
const GeneralEnclosed_structure = {
    kind: String,
    function: [String, null],
    children: [[]]
};

// <function-token> <any-value> )
// ( <any-value> )
function GeneralEnclosed_parse(kind) {
    const start = this.tokenStart;
    let functionName = null;

    if (this.tokenType === (/* inlined export .Function */2)) {
        functionName = this.consumeFunctionName();
    } else {
        this.eat((/* inlined export .LeftParenthesis */21));
    }

    const children = this.parseWithFallback(
        () => {
            const startValueToken = this.tokenIndex;
            const children = this.readSequence(this.scope.Value);

            if (this.eof === false &&
                this.isBalanceEdge(startValueToken) === false) {
                this.error();
            }

            return children;
        },
        () => this.createSingleNodeList(
            this.Raw(null, false)
        )
    );

    if (!this.eof) {
        this.eat((/* inlined export .RightParenthesis */22));
    }

    return {
        type: 'GeneralEnclosed',
        loc: this.getLocation(start, this.tokenStart),
        kind,
        function: functionName,
        children
    };
}

function GeneralEnclosed_generate(node) {
    if (node.function) {
        this.token((/* inlined export .Function */2), node.function + '(');
    } else {
        this.token((/* inlined export .LeftParenthesis */21), '(');
    }

    this.children(node);
    this.token((/* inlined export .RightParenthesis */22), ')');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Hash.js


// '#' ident
const xxx = 'XXX';
const Hash_name = 'Hash';
const Hash_structure = {
    value: String
};
function Hash_parse() {
    const start = this.tokenStart;

    this.eat((/* inlined export .Hash */4));

    return {
        type: 'Hash',
        loc: this.getLocation(start, this.tokenStart),
        value: this.substrToCursor(start + 1)
    };
}
function Hash_generate(node) {
    this.token((/* inlined export .Hash */4), '#' + node.value);
}


;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Identifier.js


const Identifier_name = 'Identifier';
const Identifier_structure = {
    name: String
};

function Identifier_parse() {
    return {
        type: 'Identifier',
        loc: this.getLocation(this.tokenStart, this.tokenEnd),
        name: this.consume((/* inlined export .Ident */1))
    };
}

function Identifier_generate(node) {
    this.token((/* inlined export .Ident */1), node.name);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/IdSelector.js


const IdSelector_name = 'IdSelector';
const IdSelector_structure = {
    name: String
};

function IdSelector_parse() {
    const start = this.tokenStart;

    // TODO: check value is an ident
    this.eat((/* inlined export .Hash */4));

    return {
        type: 'IdSelector',
        loc: this.getLocation(start, this.tokenStart),
        name: this.substrToCursor(start + 1)
    };
}

function IdSelector_generate(node) {
    // Using Delim instead of Hash is a hack to avoid for a whitespace between ident and id-selector
    // in safe mode (e.g. "a#id"), because IE11 doesn't allow a sequence <ident-token> <hash-token>
    // without a whitespace in values (e.g. "1px solid#000")
    this.token((/* inlined export .Delim */9), '#' + node.name);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Layer.js


const Layer_FULLSTOP = 0x002E; // U+002E FULL STOP (.)

const Layer_name = 'Layer';
const Layer_structure = {
    name: String
};

function Layer_parse() {
    let tokenStart = this.tokenStart;
    let name = this.consume((/* inlined export .Ident */1));

    while (this.isDelim(Layer_FULLSTOP)) {
        this.eat((/* inlined export .Delim */9));
        name += '.' + this.consume((/* inlined export .Ident */1));
    }

    return {
        type: 'Layer',
        loc: this.getLocation(tokenStart, this.tokenStart),
        name
    };
}

function Layer_generate(node) {
    this.tokenize(node.name);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/LayerList.js


const LayerList_name = 'LayerList';
const LayerList_structure = {
    children: [[
        'Layer'
    ]]
};

function LayerList_parse() {
    const children = this.createList();

    this.skipSC();

    while (!this.eof) {
        children.push(this.Layer());

        if (this.lookupTypeNonSC(0) !== (/* inlined export .Comma */18)) {
            break;
        }

        this.skipSC();
        this.next();
        this.skipSC();
    }

    return {
        type: 'LayerList',
        loc: this.getLocationFromList(children),
        children
    };
}

function LayerList_generate(node) {
    this.children(node, () => this.token((/* inlined export .Comma */18), ','));
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/MediaQuery.js


const MediaQuery_name = 'MediaQuery';
const MediaQuery_structure = {
    modifier: [String, null],
    mediaType: [String, null],
    condition: ['Condition', null]
};

function MediaQuery_parse() {
    const start = this.tokenStart;
    let modifier = null;
    let mediaType = null;
    let condition = null;

    this.skipSC();

    if (this.tokenType === (/* inlined export .Ident */1) && this.lookupTypeNonSC(1) !== (/* inlined export .LeftParenthesis */21)) {
        // [ not | only ]? <media-type>
        const ident = this.consume((/* inlined export .Ident */1));
        const identLowerCase = ident.toLowerCase();

        if (identLowerCase === 'not' || identLowerCase === 'only') {
            this.skipSC();
            modifier = identLowerCase;
            mediaType = this.consume((/* inlined export .Ident */1));
        } else {
            mediaType = ident;
        }

        switch (this.lookupTypeNonSC(0)) {
            case (/* inlined export .Ident */1): {
                // and <media-condition-without-or>
                this.skipSC();
                this.eatIdent('and');
                condition = this.Condition('media');
                break;
            }

            case (/* inlined export .LeftCurlyBracket */23):
            case (/* inlined export .Semicolon */17):
            case (/* inlined export .Comma */18):
            case (/* inlined export .EOF */0):
                break;

            default:
                this.error('Identifier or parenthesis is expected');
        }
    } else {
        switch (this.tokenType) {
            case (/* inlined export .Ident */1):
            case (/* inlined export .LeftParenthesis */21):
            case (/* inlined export .Function */2): {
                // <media-condition>
                condition = this.Condition('media');
                break;
            }

            case (/* inlined export .LeftCurlyBracket */23):
            case (/* inlined export .Semicolon */17):
            case (/* inlined export .EOF */0):
                break;

            default:
                this.error('Identifier or parenthesis is expected');
        }
    }

    return {
        type: 'MediaQuery',
        loc: this.getLocation(start, this.tokenStart),
        modifier,
        mediaType,
        condition
    };
}

function MediaQuery_generate(node) {
    if (node.mediaType) {
        if (node.modifier) {
            this.token((/* inlined export .Ident */1), node.modifier);
        }

        this.token((/* inlined export .Ident */1), node.mediaType);

        if (node.condition) {
            this.token((/* inlined export .Ident */1), 'and');
            this.node(node.condition);
        }
    } else if (node.condition) {
        this.node(node.condition);
    }
}


;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/MediaQueryList.js


const MediaQueryList_name = 'MediaQueryList';
const MediaQueryList_structure = {
    children: [[
        'MediaQuery'
    ]]
};

function MediaQueryList_parse() {
    const children = this.createList();

    this.skipSC();

    while (!this.eof) {
        children.push(this.MediaQuery());

        if (this.tokenType !== (/* inlined export .Comma */18)) {
            break;
        }

        this.next();
    }

    return {
        type: 'MediaQueryList',
        loc: this.getLocationFromList(children),
        children
    };
}

function MediaQueryList_generate(node) {
    this.children(node, () => this.token((/* inlined export .Comma */18), ','));
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/NestingSelector.js


const NestingSelector_AMPERSAND = 0x0026;       // U+0026 AMPERSAND (&)

const NestingSelector_name = 'NestingSelector';
const NestingSelector_structure = {
};

function NestingSelector_parse() {
    const start = this.tokenStart;

    this.eatDelim(NestingSelector_AMPERSAND);

    return {
        type: 'NestingSelector',
        loc: this.getLocation(start, this.tokenStart)
    };
}

function NestingSelector_generate() {
    this.token((/* inlined export .Delim */9), '&');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Nth.js


const Nth_name = 'Nth';
const Nth_structure = {
    nth: ['AnPlusB', 'Identifier'],
    selector: ['SelectorList', null]
};

function Nth_parse() {
    this.skipSC();

    const start = this.tokenStart;
    let end = start;
    let selector = null;
    let nth;

    if (this.lookupValue(0, 'odd') || this.lookupValue(0, 'even')) {
        nth = this.Identifier();
    } else {
        nth = this.AnPlusB();
    }

    end = this.tokenStart;
    this.skipSC();

    if (this.lookupValue(0, 'of')) {
        this.next();

        selector = this.SelectorList();
        end = this.tokenStart;
    }

    return {
        type: 'Nth',
        loc: this.getLocation(start, end),
        nth,
        selector
    };
}

function Nth_generate(node) {
    this.node(node.nth);
    if (node.selector !== null) {
        this.token((/* inlined export .Ident */1), 'of');
        this.node(node.selector);
    }
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Number.js


const Number_name = 'Number';
const Number_structure = {
    value: String
};

function Number_parse() {
    return {
        type: 'Number',
        loc: this.getLocation(this.tokenStart, this.tokenEnd),
        value: this.consume((/* inlined export .Number */10))
    };
}

function Number_generate(node) {
    this.token((/* inlined export .Number */10), node.value);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Operator.js
// '/' | '*' | ',' | ':' | '+' | '-'
const Operator_name = 'Operator';
const Operator_structure = {
    value: String
};

function Operator_parse() {
    const start = this.tokenStart;

    this.next();

    return {
        type: 'Operator',
        loc: this.getLocation(start, this.tokenStart),
        value: this.substrToCursor(start)
    };
}

function Operator_generate(node) {
    this.tokenize(node.value);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Parentheses.js


const Parentheses_name = 'Parentheses';
const Parentheses_structure = {
    children: [[]]
};

function Parentheses_parse(readSequence, recognizer) {
    const start = this.tokenStart;
    let children = null;

    this.eat((/* inlined export .LeftParenthesis */21));

    children = readSequence.call(this, recognizer);

    if (!this.eof) {
        this.eat((/* inlined export .RightParenthesis */22));
    }

    return {
        type: 'Parentheses',
        loc: this.getLocation(start, this.tokenStart),
        children
    };
}

function Parentheses_generate(node) {
    this.token((/* inlined export .LeftParenthesis */21), '(');
    this.children(node);
    this.token((/* inlined export .RightParenthesis */22), ')');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Percentage.js


const Percentage_name = 'Percentage';
const Percentage_structure = {
    value: String
};

function Percentage_parse() {
    return {
        type: 'Percentage',
        loc: this.getLocation(this.tokenStart, this.tokenEnd),
        value: this.consumeNumber((/* inlined export .Percentage */11))
    };
}

function Percentage_generate(node) {
    this.token((/* inlined export .Percentage */11), node.value + '%');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/PseudoClassSelector.js



const PseudoClassSelector_name = 'PseudoClassSelector';
const PseudoClassSelector_walkContext = 'function';
const PseudoClassSelector_structure = {
    name: String,
    children: [['Raw'], null]
};

// : [ <ident> | <function-token> <any-value>? ) ]
function PseudoClassSelector_parse() {
    const start = this.tokenStart;
    let children = null;
    let name;
    let nameLowerCase;

    this.eat((/* inlined export .Colon */16));

    if (this.tokenType === (/* inlined export .Function */2)) {
        name = this.consumeFunctionName();
        nameLowerCase = name.toLowerCase();

        if (this.lookupNonWSType(0) == (/* inlined export .RightParenthesis */22)) {
            children = this.createList();
        } else if (hasOwnProperty.call(this.pseudo, nameLowerCase)) {
            this.skipSC();
            children = this.pseudo[nameLowerCase].call(this);
            this.skipSC();
        } else {
            children = this.createList();
            children.push(
                this.Raw(null, false)
            );
        }

        this.eat((/* inlined export .RightParenthesis */22));
    } else {
        name = this.consume((/* inlined export .Ident */1));
    }

    return {
        type: 'PseudoClassSelector',
        loc: this.getLocation(start, this.tokenStart),
        name,
        children
    };
}

function PseudoClassSelector_generate(node) {
    this.token((/* inlined export .Colon */16), ':');

    if (node.children === null) {
        this.token((/* inlined export .Ident */1), node.name);
    } else {
        this.token((/* inlined export .Function */2), node.name + '(');
        this.children(node);
        this.token((/* inlined export .RightParenthesis */22), ')');
    }
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/PseudoElementSelector.js


const PseudoElementSelector_name = 'PseudoElementSelector';
const PseudoElementSelector_walkContext = 'function';
const PseudoElementSelector_structure = {
    name: String,
    children: [['Raw'], null]
};

// :: [ <ident> | <function-token> <any-value>? ) ]
function PseudoElementSelector_parse() {
    const start = this.tokenStart;
    let children = null;
    let name;
    let nameLowerCase;

    this.eat((/* inlined export .Colon */16));
    this.eat((/* inlined export .Colon */16));

    if (this.tokenType === (/* inlined export .Function */2)) {
        name = this.consumeFunctionName();
        nameLowerCase = name.toLowerCase();

        if (this.lookupNonWSType(0) == (/* inlined export .RightParenthesis */22)) {
            children = this.createList();
        } else if (hasOwnProperty.call(this.pseudo, nameLowerCase)) {
            this.skipSC();
            children = this.pseudo[nameLowerCase].call(this);
            this.skipSC();
        } else {
            children = this.createList();
            children.push(
                this.Raw(null, false)
            );
        }

        this.eat((/* inlined export .RightParenthesis */22));
    } else {
        name = this.consume((/* inlined export .Ident */1));
    }

    return {
        type: 'PseudoElementSelector',
        loc: this.getLocation(start, this.tokenStart),
        name,
        children
    };
}

function PseudoElementSelector_generate(node) {
    this.token((/* inlined export .Colon */16), ':');
    this.token((/* inlined export .Colon */16), ':');

    if (node.children === null) {
        this.token((/* inlined export .Ident */1), node.name);
    } else {
        this.token((/* inlined export .Function */2), node.name + '(');
        this.children(node);
        this.token((/* inlined export .RightParenthesis */22), ')');
    }
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Ratio.js


const Ratio_SOLIDUS = 0x002F;  // U+002F SOLIDUS (/)

// Media Queries Level 3 defines terms of <ratio> as a positive (not zero or negative)
// integers (see https://drafts.csswg.org/mediaqueries-3/#values)
// However, Media Queries Level 4 removes any definition of values
// (see https://drafts.csswg.org/mediaqueries-4/#values) and refers to
// CSS Values and Units for detail. In CSS Values and Units Level 4 a <ratio>
// definition was added (see https://drafts.csswg.org/css-values-4/#ratios) which
// defines ratio as "<number [0,∞]> [ / <number [0,∞]> ]?" and based on it
// any constrains on terms were removed. Parser also doesn't test numbers
// in any way to make possible for linting and fixing them by the tools using CSSTree.
// An additional syntax examination may be applied by a lexer.
function consumeTerm() {
    this.skipSC();

    switch (this.tokenType) {
        case (/* inlined export .Number */10):
            return this.Number();

        case (/* inlined export .Function */2):
            return this.Function(this.readSequence, this.scope.Value);

        default:
            this.error('Number of function is expected');
    }
}

const Ratio_name = 'Ratio';
const Ratio_structure = {
    left: ['Number', 'Function'],
    right: ['Number', 'Function', null]
};

// <number [0,∞]> [ / <number [0,∞]> ]?
function Ratio_parse() {
    const start = this.tokenStart;
    const left = consumeTerm.call(this);
    let right = null;

    this.skipSC();
    if (this.isDelim(Ratio_SOLIDUS)) {
        this.eatDelim(Ratio_SOLIDUS);
        right = consumeTerm.call(this);
    }

    return {
        type: 'Ratio',
        loc: this.getLocation(start, this.tokenStart),
        left,
        right
    };
}

function Ratio_generate(node) {
    this.node(node.left);
    this.token((/* inlined export .Delim */9), '/');
    if (node.right) {
        this.node(node.right);
    } else {
        this.node((/* inlined export .Number */10), 1);
    }
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Raw.js


function getOffsetExcludeWS() {
    if (this.tokenIndex > 0) {
        if (this.lookupType(-1) === (/* inlined export .WhiteSpace */13)) {
            return this.tokenIndex > 1
                ? this.getTokenStart(this.tokenIndex - 1)
                : this.firstCharOffset;
        }
    }

    return this.tokenStart;
}

const Raw_name = 'Raw';
const Raw_structure = {
    value: String
};

function Raw_parse(consumeUntil, excludeWhiteSpace) {
    const startOffset = this.getTokenStart(this.tokenIndex);
    let endOffset;

    this.skipUntilBalanced(this.tokenIndex, consumeUntil || this.consumeUntilBalanceEnd);

    if (excludeWhiteSpace && this.tokenStart > startOffset) {
        endOffset = getOffsetExcludeWS.call(this);
    } else {
        endOffset = this.tokenStart;
    }

    return {
        type: 'Raw',
        loc: this.getLocation(startOffset, endOffset),
        value: this.substring(startOffset, endOffset)
    };
}

function Raw_generate(node) {
    this.tokenize(node.value);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Rule.js


function Rule_consumeRaw() {
    return this.Raw(this.consumeUntilLeftCurlyBracket, true);
}

function consumePrelude() {
    const prelude = this.SelectorList();

    if (prelude.type !== 'Raw' &&
        this.eof === false &&
        this.tokenType !== (/* inlined export .LeftCurlyBracket */23)) {
        this.error();
    }

    return prelude;
}

const Rule_name = 'Rule';
const Rule_walkContext = 'rule';
const Rule_structure = {
    prelude: ['SelectorList', 'Raw'],
    block: ['Block']
};

function Rule_parse() {
    const startToken = this.tokenIndex;
    const startOffset = this.tokenStart;
    let prelude;
    let block;

    if (this.parseRulePrelude) {
        prelude = this.parseWithFallback(consumePrelude, Rule_consumeRaw);
    } else {
        prelude = Rule_consumeRaw.call(this, startToken);
    }

    block = this.Block(true);

    return {
        type: 'Rule',
        loc: this.getLocation(startOffset, this.tokenStart),
        prelude,
        block
    };
}
function Rule_generate(node) {
    this.node(node.prelude);
    this.node(node.block);
}


;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Scope.js


const Scope_name = 'Scope';
const Scope_structure = {
    root: ['SelectorList', 'Raw', null],
    limit: ['SelectorList', 'Raw', null]
};

function Scope_parse() {
    let root = null;
    let limit = null;

    this.skipSC();

    const startOffset = this.tokenStart;
    if (this.tokenType === (/* inlined export .LeftParenthesis */21)) {
        this.next();
        this.skipSC();
        root = this.parseWithFallback(
            this.SelectorList,
            () => this.Raw(false, true)
        );
        this.skipSC();
        this.eat((/* inlined export .RightParenthesis */22));
    }

    if (this.lookupNonWSType(0) === (/* inlined export .Ident */1)) {
        this.skipSC();
        this.eatIdent('to');
        this.skipSC();
        this.eat((/* inlined export .LeftParenthesis */21));
        this.skipSC();
        limit = this.parseWithFallback(
            this.SelectorList,
            () => this.Raw(false, true)
        );
        this.skipSC();
        this.eat((/* inlined export .RightParenthesis */22));
    }

    return {
        type: 'Scope',
        loc: this.getLocation(startOffset, this.tokenStart),
        root,
        limit
    };
}

function Scope_generate(node) {
    if (node.root) {
        this.token((/* inlined export .LeftParenthesis */21), '(');
        this.node(node.root);
        this.token((/* inlined export .RightParenthesis */22), ')');
    }

    if (node.limit) {
        this.token((/* inlined export .Ident */1), 'to');
        this.token((/* inlined export .LeftParenthesis */21), '(');
        this.node(node.limit);
        this.token((/* inlined export .RightParenthesis */22), ')');
    }
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Selector.js
const Selector_name = 'Selector';
const Selector_structure = {
    children: [[
        'TypeSelector',
        'IdSelector',
        'ClassSelector',
        'AttributeSelector',
        'PseudoClassSelector',
        'PseudoElementSelector',
        'Combinator'
    ]]
};

function Selector_parse() {
    const children = this.readSequence(this.scope.Selector);

    // nothing were consumed
    if (this.getFirstListNode(children) === null) {
        this.error('Selector is expected');
    }

    return {
        type: 'Selector',
        loc: this.getLocationFromList(children),
        children
    };
}

function Selector_generate(node) {
    this.children(node);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/SelectorList.js


const SelectorList_name = 'SelectorList';
const SelectorList_walkContext = 'selector';
const SelectorList_structure = {
    children: [[
        'Selector',
        'Raw'
    ]]
};

function SelectorList_parse() {
    const children = this.createList();

    while (!this.eof) {
        children.push(this.Selector());

        if (this.tokenType === (/* inlined export .Comma */18)) {
            this.next();
            continue;
        }

        break;
    }

    return {
        type: 'SelectorList',
        loc: this.getLocationFromList(children),
        children
    };
}

function SelectorList_generate(node) {
    this.children(node, () => this.token((/* inlined export .Comma */18), ','));
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/utils/string.js


const REVERSE_SOLIDUS = 0x005c; // U+005C REVERSE SOLIDUS (\)
const QUOTATION_MARK = 0x0022;  // "
const string_APOSTROPHE = 0x0027;      // '

function decode(str) {
    const len = str.length;
    const firstChar = str.charCodeAt(0);
    const start = firstChar === QUOTATION_MARK || firstChar === string_APOSTROPHE ? 1 : 0;
    const end = start === 1 && len > 1 && str.charCodeAt(len - 1) === firstChar ? len - 2 : len - 1;
    let decoded = '';

    for (let i = start; i <= end; i++) {
        let code = str.charCodeAt(i);

        if (code === REVERSE_SOLIDUS) {
            // special case at the ending
            if (i === end) {
                // if the next input code point is EOF, do nothing
                // otherwise include last quote as escaped
                if (i !== len - 1) {
                    decoded = str.substr(i + 1);
                }
                break;
            }

            code = str.charCodeAt(++i);

            // consume escaped
            if (isValidEscape(REVERSE_SOLIDUS, code)) {
                const escapeStart = i - 1;
                const escapeEnd = consumeEscaped(str, escapeStart);

                i = escapeEnd - 1;
                decoded += decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
            } else {
                // \r\n
                if (code === 0x000d && str.charCodeAt(i + 1) === 0x000a) {
                    i++;
                }
            }
        } else {
            decoded += str[i];
        }
    }

    return decoded;
}

// https://drafts.csswg.org/cssom/#serialize-a-string
// § 2.1. Common Serializing Idioms
function encode(str, apostrophe) {
    const quote = apostrophe ? '\'' : '"';
    const quoteCode = apostrophe ? string_APOSTROPHE : QUOTATION_MARK;
    let encoded = '';
    let wsBeforeHexIsNeeded = false;

    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);

        // If the character is NULL (U+0000), then the REPLACEMENT CHARACTER (U+FFFD).
        if (code === 0x0000) {
            encoded += '\uFFFD';
            continue;
        }

        // If the character is in the range [\1-\1f] (U+0001 to U+001F) or is U+007F,
        // the character escaped as code point.
        // Note: Do not compare with 0x0001 since 0x0000 is precessed before
        if (code <= 0x001f || code === 0x007F) {
            encoded += '\\' + code.toString(16);
            wsBeforeHexIsNeeded = true;
            continue;
        }

        // If the character is '"' (U+0022) or "\" (U+005C), the escaped character.
        if (code === quoteCode || code === REVERSE_SOLIDUS) {
            encoded += '\\' + str.charAt(i);
            wsBeforeHexIsNeeded = false;
        } else {
            if (wsBeforeHexIsNeeded && (isHexDigit(code) || isWhiteSpace(code))) {
                encoded += ' ';
            }

            // Otherwise, the character itself.
            encoded += str.charAt(i);
            wsBeforeHexIsNeeded = false;
        }
    }

    return quote + encoded + quote;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/String.js



const String_name = 'String';
const String_structure = {
    value: String
};

function String_parse() {
    return {
        type: 'String',
        loc: this.getLocation(this.tokenStart, this.tokenEnd),
        value: decode(this.consume((/* inlined export .String */5)))
    };
}

function String_generate(node) {
    this.token((/* inlined export .String */5), encode(node.value));
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/StyleSheet.js


const StyleSheet_EXCLAMATIONMARK = 0x0021; // U+0021 EXCLAMATION MARK (!)

function StyleSheet_consumeRaw() {
    return this.Raw(null, false);
}

const StyleSheet_name = 'StyleSheet';
const StyleSheet_walkContext = 'stylesheet';
const StyleSheet_structure = {
    children: [[
        'Comment',
        'CDO',
        'CDC',
        'Atrule',
        'Rule',
        'Raw'
    ]]
};

function StyleSheet_parse() {
    const start = this.tokenStart;
    const children = this.createList();
    let child;

    scan:
    while (!this.eof) {
        switch (this.tokenType) {
            case (/* inlined export .WhiteSpace */13):
                this.next();
                continue;

            case (/* inlined export .Comment */25):
                // ignore comments except exclamation comments (i.e. /*! .. */) on top level
                if (this.charCodeAt(this.tokenStart + 2) !== StyleSheet_EXCLAMATIONMARK) {
                    this.next();
                    continue;
                }

                child = this.Comment();
                break;

            case (/* inlined export .CDO */14): // <!--
                child = this.CDO();
                break;

            case (/* inlined export .CDC */15): // -->
                child = this.CDC();
                break;

            // CSS Syntax Module Level 3
            // §2.2 Error handling
            // At the "top level" of a stylesheet, an <at-keyword-token> starts an at-rule.
            case (/* inlined export .AtKeyword */3):
                child = this.parseWithFallback(this.Atrule, StyleSheet_consumeRaw);
                break;

            // Anything else starts a qualified rule ...
            default:
                child = this.parseWithFallback(this.Rule, StyleSheet_consumeRaw);
        }

        children.push(child);
    }

    return {
        type: 'StyleSheet',
        loc: this.getLocation(start, this.tokenStart),
        children
    };
}

function StyleSheet_generate(node) {
    this.children(node);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/SupportsDeclaration.js


const SupportsDeclaration_name = 'SupportsDeclaration';
const SupportsDeclaration_structure = {
    declaration: 'Declaration'
};

function SupportsDeclaration_parse() {
    const start = this.tokenStart;

    this.eat((/* inlined export .LeftParenthesis */21));
    this.skipSC();

    const declaration = this.Declaration();

    if (!this.eof) {
        this.eat((/* inlined export .RightParenthesis */22));
    }

    return {
        type: 'SupportsDeclaration',
        loc: this.getLocation(start, this.tokenStart),
        declaration
    };
}

function SupportsDeclaration_generate(node) {
    this.token((/* inlined export .LeftParenthesis */21), '(');
    this.node(node.declaration);
    this.token((/* inlined export .RightParenthesis */22), ')');
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/TypeSelector.js


const TypeSelector_ASTERISK = 0x002A;     // U+002A ASTERISK (*)
const TypeSelector_VERTICALLINE = 0x007C; // U+007C VERTICAL LINE (|)

function eatIdentifierOrAsterisk() {
    if (this.tokenType !== (/* inlined export .Ident */1) &&
        this.isDelim(TypeSelector_ASTERISK) === false) {
        this.error('Identifier or asterisk is expected');
    }

    this.next();
}

const TypeSelector_name = 'TypeSelector';
const TypeSelector_structure = {
    name: String
};

// ident
// ident|ident
// ident|*
// *
// *|ident
// *|*
// |ident
// |*
function TypeSelector_parse() {
    const start = this.tokenStart;

    if (this.isDelim(TypeSelector_VERTICALLINE)) {
        this.next();
        eatIdentifierOrAsterisk.call(this);
    } else {
        eatIdentifierOrAsterisk.call(this);

        if (this.isDelim(TypeSelector_VERTICALLINE)) {
            this.next();
            eatIdentifierOrAsterisk.call(this);
        }
    }

    return {
        type: 'TypeSelector',
        loc: this.getLocation(start, this.tokenStart),
        name: this.substrToCursor(start)
    };
}

function TypeSelector_generate(node) {
    this.tokenize(node.name);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/UnicodeRange.js


const UnicodeRange_PLUSSIGN = 0x002B;     // U+002B PLUS SIGN (+)
const UnicodeRange_HYPHENMINUS = 0x002D;  // U+002D HYPHEN-MINUS (-)
const UnicodeRange_QUESTIONMARK = 0x003F; // U+003F QUESTION MARK (?)

function eatHexSequence(offset, allowDash) {
    let len = 0;

    for (let pos = this.tokenStart + offset; pos < this.tokenEnd; pos++) {
        const code = this.charCodeAt(pos);

        if (code === UnicodeRange_HYPHENMINUS && allowDash && len !== 0) {
            eatHexSequence.call(this, offset + len + 1, false);
            return -1;
        }

        if (!isHexDigit(code)) {
            this.error(
                allowDash && len !== 0
                    ? 'Hyphen minus' + (len < 6 ? ' or hex digit' : '') + ' is expected'
                    : (len < 6 ? 'Hex digit is expected' : 'Unexpected input'),
                pos
            );
        }

        if (++len > 6) {
            this.error('Too many hex digits', pos);
        };
    }

    this.next();
    return len;
}

function eatQuestionMarkSequence(max) {
    let count = 0;

    while (this.isDelim(UnicodeRange_QUESTIONMARK)) {
        if (++count > max) {
            this.error('Too many question marks');
        }

        this.next();
    }
}

function UnicodeRange_startsWith(code) {
    if (this.charCodeAt(this.tokenStart) !== code) {
        this.error((code === UnicodeRange_PLUSSIGN ? 'Plus sign' : 'Hyphen minus') + ' is expected');
    }
}

// https://drafts.csswg.org/css-syntax/#urange
// Informally, the <urange> production has three forms:
// U+0001
//      Defines a range consisting of a single code point, in this case the code point "1".
// U+0001-00ff
//      Defines a range of codepoints between the first and the second value, in this case
//      the range between "1" and "ff" (255 in decimal) inclusive.
// U+00??
//      Defines a range of codepoints where the "?" characters range over all hex digits,
//      in this case defining the same as the value U+0000-00ff.
// In each form, a maximum of 6 digits is allowed for each hexadecimal number (if you treat "?" as a hexadecimal digit).
//
// <urange> =
//   u '+' <ident-token> '?'* |
//   u <dimension-token> '?'* |
//   u <number-token> '?'* |
//   u <number-token> <dimension-token> |
//   u <number-token> <number-token> |
//   u '+' '?'+
function scanUnicodeRange() {
    let hexLength = 0;

    switch (this.tokenType) {
        case (/* inlined export .Number */10):
            // u <number-token> '?'*
            // u <number-token> <dimension-token>
            // u <number-token> <number-token>
            hexLength = eatHexSequence.call(this, 1, true);

            if (this.isDelim(UnicodeRange_QUESTIONMARK)) {
                eatQuestionMarkSequence.call(this, 6 - hexLength);
                break;
            }

            if (this.tokenType === (/* inlined export .Dimension */12) ||
                this.tokenType === (/* inlined export .Number */10)) {
                UnicodeRange_startsWith.call(this, UnicodeRange_HYPHENMINUS);
                eatHexSequence.call(this, 1, false);
                break;
            }

            break;

        case (/* inlined export .Dimension */12):
            // u <dimension-token> '?'*
            hexLength = eatHexSequence.call(this, 1, true);

            if (hexLength > 0) {
                eatQuestionMarkSequence.call(this, 6 - hexLength);
            }

            break;

        default:
            // u '+' <ident-token> '?'*
            // u '+' '?'+
            this.eatDelim(UnicodeRange_PLUSSIGN);

            if (this.tokenType === (/* inlined export .Ident */1)) {
                hexLength = eatHexSequence.call(this, 0, true);
                if (hexLength > 0) {
                    eatQuestionMarkSequence.call(this, 6 - hexLength);
                }
                break;
            }

            if (this.isDelim(UnicodeRange_QUESTIONMARK)) {
                this.next();
                eatQuestionMarkSequence.call(this, 5);
                break;
            }

            this.error('Hex digit or question mark is expected');
    }
}

const UnicodeRange_name = 'UnicodeRange';
const UnicodeRange_structure = {
    value: String
};

function UnicodeRange_parse() {
    const start = this.tokenStart;

    // U or u
    this.eatIdent('u');
    scanUnicodeRange.call(this);

    return {
        type: 'UnicodeRange',
        loc: this.getLocation(start, this.tokenStart),
        value: this.substrToCursor(start)
    };
}

function UnicodeRange_generate(node) {
    this.tokenize(node.value);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/utils/url.js


const url_SPACE = 0x0020;            // U+0020 SPACE
const url_REVERSE_SOLIDUS = 0x005c;  // U+005C REVERSE SOLIDUS (\)
const url_QUOTATION_MARK = 0x0022;   // "
const url_APOSTROPHE = 0x0027;       // '
const url_LEFTPARENTHESIS = 0x0028;  // U+0028 LEFT PARENTHESIS (()
const url_RIGHTPARENTHESIS = 0x0029; // U+0029 RIGHT PARENTHESIS ())

function url_decode(str) {
    const len = str.length;
    let start = 4; // length of "url("
    let end = str.charCodeAt(len - 1) === url_RIGHTPARENTHESIS ? len - 2 : len - 1;
    let decoded = '';

    while (start < end && isWhiteSpace(str.charCodeAt(start))) {
        start++;
    }

    while (start < end && isWhiteSpace(str.charCodeAt(end))) {
        end--;
    }

    for (let i = start; i <= end; i++) {
        let code = str.charCodeAt(i);

        if (code === url_REVERSE_SOLIDUS) {
            // special case at the ending
            if (i === end) {
                // if the next input code point is EOF, do nothing
                // otherwise include last left parenthesis as escaped
                if (i !== len - 1) {
                    decoded = str.substr(i + 1);
                }
                break;
            }

            code = str.charCodeAt(++i);

            // consume escaped
            if (isValidEscape(url_REVERSE_SOLIDUS, code)) {
                const escapeStart = i - 1;
                const escapeEnd = consumeEscaped(str, escapeStart);

                i = escapeEnd - 1;
                decoded += decodeEscaped(str.substring(escapeStart + 1, escapeEnd));
            } else {
                // \r\n
                if (code === 0x000d && str.charCodeAt(i + 1) === 0x000a) {
                    i++;
                }
            }
        } else {
            decoded += str[i];
        }
    }

    return decoded;
}

function url_encode(str) {
    let encoded = '';
    let wsBeforeHexIsNeeded = false;

    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);

        // If the character is NULL (U+0000), then the REPLACEMENT CHARACTER (U+FFFD).
        if (code === 0x0000) {
            encoded += '\uFFFD';
            continue;
        }

        // If the character is in the range [\1-\1f] (U+0001 to U+001F) or is U+007F,
        // the character escaped as code point.
        // Note: Do not compare with 0x0001 since 0x0000 is precessed before
        if (code <= 0x001f || code === 0x007F) {
            encoded += '\\' + code.toString(16);
            wsBeforeHexIsNeeded = true;
            continue;
        }

        if (code === url_SPACE ||
            code === url_REVERSE_SOLIDUS ||
            code === url_QUOTATION_MARK ||
            code === url_APOSTROPHE ||
            code === url_LEFTPARENTHESIS ||
            code === url_RIGHTPARENTHESIS) {
            encoded += '\\' + str.charAt(i);
            wsBeforeHexIsNeeded = false;
        } else {
            if (wsBeforeHexIsNeeded && isHexDigit(code)) {
                encoded += ' ';
            }

            encoded += str.charAt(i);
            wsBeforeHexIsNeeded = false;
        }
    }

    return 'url(' + encoded + ')';
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Url.js




const Url_name = 'Url';
const Url_structure = {
    value: String
};

// <url-token> | <function-token> <string> )
function Url_parse() {
    const start = this.tokenStart;
    let value;

    switch (this.tokenType) {
        case (/* inlined export .Url */7):
            value = url_decode(this.consume((/* inlined export .Url */7)));
            break;

        case (/* inlined export .Function */2):
            if (!this.cmpStr(this.tokenStart, this.tokenEnd, 'url(')) {
                this.error('Function name must be `url`');
            }

            this.eat((/* inlined export .Function */2));
            this.skipSC();
            value = decode(this.consume((/* inlined export .String */5)));
            this.skipSC();
            if (!this.eof) {
                this.eat((/* inlined export .RightParenthesis */22));
            }
            break;

        default:
            this.error('Url or Function is expected');
    }

    return {
        type: 'Url',
        loc: this.getLocation(start, this.tokenStart),
        value
    };
}

function Url_generate(node) {
    this.token((/* inlined export .Url */7), url_encode(node.value));
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/Value.js
const Value_name = 'Value';
const Value_structure = {
    children: [[]]
};

function Value_parse() {
    const start = this.tokenStart;
    const children = this.readSequence(this.scope.Value);

    return {
        type: 'Value',
        loc: this.getLocation(start, this.tokenStart),
        children
    };
}

function Value_generate(node) {
    this.children(node);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/WhiteSpace.js


const WhiteSpace_SPACE = Object.freeze({
    type: 'WhiteSpace',
    loc: null,
    value: ' '
});

const WhiteSpace_name = 'WhiteSpace';
const WhiteSpace_structure = {
    value: String
};

function WhiteSpace_parse() {
    this.eat((/* inlined export .WhiteSpace */13));
    return WhiteSpace_SPACE;

    // return {
    //     type: 'WhiteSpace',
    //     loc: this.getLocation(this.tokenStart, this.tokenEnd),
    //     value: this.consume(WHITESPACE)
    // };
}

function WhiteSpace_generate(node) {
    this.token((/* inlined export .WhiteSpace */13), node.value);
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/index.js


















































;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/config/lexer.js




/* export default */ var config_lexer = ({
    generic: true,
    cssWideKeywords: cssWideKeywords,
    ...dist_data,
    node: node_namespaceObject
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/scope/default.js


const default_NUMBERSIGN = 0x0023;  // U+0023 NUMBER SIGN (#)
const default_ASTERISK = 0x002A;    // U+002A ASTERISK (*)
const default_PLUSSIGN = 0x002B;    // U+002B PLUS SIGN (+)
const default_HYPHENMINUS = 0x002D; // U+002D HYPHEN-MINUS (-)
const default_SOLIDUS = 0x002F;     // U+002F SOLIDUS (/)
const default_U = 0x0075;           // U+0075 LATIN SMALL LETTER U (u)

function defaultRecognizer(context) {
    switch (this.tokenType) {
        case (/* inlined export .Hash */4):
            return this.Hash();

        case (/* inlined export .Comma */18):
            return this.Operator();

        case (/* inlined export .LeftParenthesis */21):
            return this.Parentheses(this.readSequence, context.recognizer);

        case (/* inlined export .LeftSquareBracket */19):
            return this.Brackets(this.readSequence, context.recognizer);

        case (/* inlined export .String */5):
            return this.String();

        case (/* inlined export .Dimension */12):
            return this.Dimension();

        case (/* inlined export .Percentage */11):
            return this.Percentage();

        case (/* inlined export .Number */10):
            return this.Number();

        case (/* inlined export .Function */2):
            return this.cmpStr(this.tokenStart, this.tokenEnd, 'url(')
                ? this.Url()
                : this.Function(this.readSequence, context.recognizer);

        case (/* inlined export .Url */7):
            return this.Url();

        case (/* inlined export .Ident */1):
            // check for unicode range, it should start with u+ or U+
            if (this.cmpChar(this.tokenStart, default_U) &&
                this.cmpChar(this.tokenStart + 1, default_PLUSSIGN)) {
                return this.UnicodeRange();
            } else {
                return this.Identifier();
            }

        case (/* inlined export .Delim */9): {
            const code = this.charCodeAt(this.tokenStart);

            if (code === default_SOLIDUS ||
                code === default_ASTERISK ||
                code === default_PLUSSIGN ||
                code === default_HYPHENMINUS) {
                return this.Operator(); // TODO: replace with Delim
            }

            // TODO: produce a node with Delim node type

            if (code === default_NUMBERSIGN) {
                this.error('Hex or identifier is expected', this.tokenStart + 1);
            }

            break;
        }
    }
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/scope/atrulePrelude.js


/* export default */ var atrulePrelude = ({
    getNode: defaultRecognizer
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/scope/selector.js


const selector_NUMBERSIGN = 0x0023;      // U+0023 NUMBER SIGN (#)
const selector_AMPERSAND = 0x0026;       // U+0026 AMPERSAND (&)
const selector_ASTERISK = 0x002A;        // U+002A ASTERISK (*)
const selector_PLUSSIGN = 0x002B;        // U+002B PLUS SIGN (+)
const selector_SOLIDUS = 0x002F;         // U+002F SOLIDUS (/)
const selector_FULLSTOP = 0x002E;        // U+002E FULL STOP (.)
const selector_GREATERTHANSIGN = 0x003E; // U+003E GREATER-THAN SIGN (>)
const selector_VERTICALLINE = 0x007C;    // U+007C VERTICAL LINE (|)
const selector_TILDE = 0x007E;           // U+007E TILDE (~)

function onWhiteSpace(next, children) {
    if (children.last !== null && children.last.type !== 'Combinator' &&
        next !== null && next.type !== 'Combinator') {
        children.push({  // FIXME: this.Combinator() should be used instead
            type: 'Combinator',
            loc: null,
            name: ' '
        });
    }
}

function getNode() {
    switch (this.tokenType) {
        case (/* inlined export .LeftSquareBracket */19):
            return this.AttributeSelector();

        case (/* inlined export .Hash */4):
            return this.IdSelector();

        case (/* inlined export .Colon */16):
            if (this.lookupType(1) === (/* inlined export .Colon */16)) {
                return this.PseudoElementSelector();
            } else {
                return this.PseudoClassSelector();
            }

        case (/* inlined export .Ident */1):
            return this.TypeSelector();

        case (/* inlined export .Number */10):
        case (/* inlined export .Percentage */11):
            return this.Percentage();

        case (/* inlined export .Dimension */12):
            // throws when .123ident
            if (this.charCodeAt(this.tokenStart) === selector_FULLSTOP) {
                this.error('Identifier is expected', this.tokenStart + 1);
            }
            break;

        case (/* inlined export .Delim */9): {
            const code = this.charCodeAt(this.tokenStart);

            switch (code) {
                case selector_PLUSSIGN:
                case selector_GREATERTHANSIGN:
                case selector_TILDE:
                case selector_SOLIDUS:  // /deep/
                    return this.Combinator();

                case selector_FULLSTOP:
                    return this.ClassSelector();

                case selector_ASTERISK:
                case selector_VERTICALLINE:
                    return this.TypeSelector();

                case selector_NUMBERSIGN:
                    return this.IdSelector();

                case selector_AMPERSAND:
                    return this.NestingSelector();
            }

            break;
        }
    }
};

/* export default */ var scope_selector = ({
    onWhiteSpace,
    getNode
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/function/expression.js
// legacy IE function
// expression( <any-value> )
/* export default */ function expression() {
    return this.createSingleNodeList(
        this.Raw(null, false)
    );
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/function/var.js


// var( <ident> , <value>? )
/* export default */ function function_var() {
    const children = this.createList();

    this.skipSC();

    // NOTE: Don't check more than a first argument is an ident, rest checks are for lexer
    children.push(this.Identifier());

    this.skipSC();

    if (this.tokenType === (/* inlined export .Comma */18)) {
        children.push(this.Operator());

        const startIndex = this.tokenIndex;
        const value = this.parseCustomProperty
            ? this.Value(null)
            : this.Raw(this.consumeUntilExclamationMarkOrSemicolon, false);

        if (value.type === 'Value' && value.children.isEmpty) {
            for (let offset = startIndex - this.tokenIndex; offset <= 0; offset++) {
                if (this.lookupType(offset) === (/* inlined export .WhiteSpace */13)) {
                    value.children.appendData({
                        type: 'WhiteSpace',
                        loc: null,
                        value: ' '
                    });
                    break;
                }
            }
        }

        children.push(value);
    }

    return children;
};

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/scope/value.js




function isPlusMinusOperator(node) {
    return (
        node !== null &&
        node.type === 'Operator' &&
        (node.value[node.value.length - 1] === '-' || node.value[node.value.length - 1] === '+')
    );
}

/* export default */ var scope_value = ({
    getNode: defaultRecognizer,
    onWhiteSpace(next, children) {
        if (isPlusMinusOperator(next)) {
            next.value = ' ' + next.value;
        }
        if (isPlusMinusOperator(children.last)) {
            children.last.value += ' ';
        }
    },
    'expression': expression,
    'var': function_var
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/scope/index.js




;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/container.js


// https://drafts.csswg.org/css-contain-3/#container-rule
// The keywords `none`, `and`, `not`, and `or` are excluded from the <custom-ident> above.
const nonContainerNameKeywords = new Set(['none', 'and', 'not', 'or']);

/* export default */ var container = ({
    parse: {
        prelude() {
            const children = this.createList();

            if (this.tokenType === (/* inlined export .Ident */1)) {
                const name = this.substring(this.tokenStart, this.tokenEnd);

                if (!nonContainerNameKeywords.has(name.toLowerCase())) {
                    children.push(this.Identifier());
                }
            }

            children.push(this.Condition('container'));

            return children;
        },
        block(nested = false) {
            return this.Block(nested);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/font-face.js
/* export default */ var font_face = ({
    parse: {
        prelude: null,
        block() {
            return this.Block(true);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/import.js


function parseWithFallback(parse, fallback) {
    return this.parseWithFallback(
        () => {
            try {
                return parse.call(this);
            } finally {
                this.skipSC();
                if (this.lookupNonWSType(0) !== (/* inlined export .RightParenthesis */22)) {
                    this.error();
                }
            }
        },
        fallback || (() => this.Raw(null, true))
    );
}

const parseFunctions = {
    layer() {
        this.skipSC();

        const children = this.createList();
        const node = parseWithFallback.call(this, this.Layer);

        if (node.type !== 'Raw' || node.value !== '') {
            children.push(node);
        }

        return children;
    },
    supports() {
        this.skipSC();

        const children = this.createList();
        const node = parseWithFallback.call(
            this,
            this.Declaration,
            () => parseWithFallback.call(this, () => this.Condition('supports'))
        );

        if (node.type !== 'Raw' || node.value !== '') {
            children.push(node);
        }

        return children;
    }
};

/* export default */ var atrule_import = ({
    parse: {
        prelude() {
            const children = this.createList();

            switch (this.tokenType) {
                case (/* inlined export .String */5):
                    children.push(this.String());
                    break;

                case (/* inlined export .Url */7):
                case (/* inlined export .Function */2):
                    children.push(this.Url());
                    break;

                default:
                    this.error('String or url() is expected');
            }

            this.skipSC();

            if (this.tokenType === (/* inlined export .Ident */1) &&
                this.cmpStr(this.tokenStart, this.tokenEnd, 'layer')) {
                children.push(this.Identifier());
            } else if (
                this.tokenType === (/* inlined export .Function */2) &&
                this.cmpStr(this.tokenStart, this.tokenEnd, 'layer(')
            ) {
                children.push(this.Function(null, parseFunctions));
            }

            this.skipSC();

            if (this.tokenType === (/* inlined export .Function */2) &&
                this.cmpStr(this.tokenStart, this.tokenEnd, 'supports(')) {
                children.push(this.Function(null, parseFunctions));
            }

            if (this.lookupNonWSType(0) === (/* inlined export .Ident */1) ||
                this.lookupNonWSType(0) === (/* inlined export .LeftParenthesis */21)) {
                children.push(this.MediaQueryList());
            }

            return children;
        },
        block: null
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/layer.js
/* export default */ var atrule_layer = ({
    parse: {
        prelude() {
            return this.createSingleNodeList(
                this.LayerList()
            );
        },
        block() {
            return this.Block(false);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/media.js
/* export default */ var media = ({
    parse: {
        prelude() {
            return this.createSingleNodeList(
                this.MediaQueryList()
            );
        },
        block(nested = false) {
            return this.Block(nested);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/nest.js
/* export default */ var nest = ({
    parse: {
        prelude() {
            return this.createSingleNodeList(
                this.SelectorList()
            );
        },
        block() {
            return this.Block(true);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/page.js
/* export default */ var page = ({
    parse: {
        prelude() {
            return this.createSingleNodeList(
                this.SelectorList()
            );
        },
        block() {
            return this.Block(true);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/scope.js
/* export default */ var scope = ({
    parse: {
        prelude() {
            return this.createSingleNodeList(
                this.Scope()
            );
        },
        block(nested = false) {
            return this.Block(nested);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/starting-style.js
/* export default */ var starting_style = ({
    parse: {
        prelude: null,
        block(nested = false) {
            return this.Block(nested);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/supports.js
/* export default */ var supports = ({
    parse: {
        prelude() {
            return this.createSingleNodeList(
                this.Condition('supports')
            );
        },
        block(nested = false) {
            return this.Block(nested);
        }
    }
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/atrule/index.js











/* export default */ var syntax_atrule = ({
    container: container,
    'font-face': font_face,
    import: atrule_import,
    layer: atrule_layer,
    media: media,
    nest: nest,
    page: page,
    scope: scope,
    'starting-style': starting_style,
    supports: supports
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/pseudo/lang.js


function parseLanguageRangeList() {
    const children = this.createList();

    this.skipSC();

    loop: while (!this.eof) {
        switch (this.tokenType) {
            case (/* inlined export .Ident */1):
                children.push(this.Identifier());
                break;

            case (/* inlined export .String */5):
                children.push(this.String());
                break;

            case (/* inlined export .Comma */18):
                children.push(this.Operator());
                break;

            case (/* inlined export .RightParenthesis */22):
                break loop;

            default:
                this.error('Identifier, string or comma is expected');
        }

        this.skipSC();
    }

    return children;
}

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/pseudo/index.js


const selectorList = {
    parse() {
        return this.createSingleNodeList(
            this.SelectorList()
        );
    }
};

const pseudo_selector = {
    parse() {
        return this.createSingleNodeList(
            this.Selector()
        );
    }
};

const identList = {
    parse() {
        return this.createSingleNodeList(
            this.Identifier()
        );
    }
};

const langList = {
    parse: parseLanguageRangeList
};

const pseudo_nth = {
    parse() {
        return this.createSingleNodeList(
            this.Nth()
        );
    }
};

/* export default */ var pseudo = ({
    'dir': identList,
    'has': selectorList,
    'lang': langList,
    'matches': selectorList,
    'is': selectorList,
    '-moz-any': selectorList,
    '-webkit-any': selectorList,
    'where': selectorList,
    'not': selectorList,
    'nth-child': pseudo_nth,
    'nth-last-child': pseudo_nth,
    'nth-last-of-type': pseudo_nth,
    'nth-of-type': pseudo_nth,
    'slotted': pseudo_selector,
    'host': pseudo_selector,
    'host-context': pseudo_selector
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/node/index-parse.js


















































;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/config/parser.js





/* export default */ var config_parser = ({
    parseContext: {
        default: 'StyleSheet',
        stylesheet: 'StyleSheet',
        atrule: 'Atrule',
        atrulePrelude(options) {
            return this.AtrulePrelude(options.atrule ? String(options.atrule) : null);
        },
        mediaQueryList: 'MediaQueryList',
        mediaQuery: 'MediaQuery',
        condition(options) {
            return this.Condition(options.kind);
        },
        rule: 'Rule',
        selectorList: 'SelectorList',
        selector: 'Selector',
        block() {
            return this.Block(true);
        },
        declarationList: 'DeclarationList',
        declaration: 'Declaration',
        value: 'Value'
    },
    features: {
        supports: {
            selector() {
                return this.Selector();
            }
        },
        container: {
            style() {
                return this.Declaration();
            }
        }
    },
    scope: scope_namespaceObject,
    atrule: syntax_atrule,
    pseudo: pseudo,
    node: index_parse_namespaceObject
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/config/walker.js


/* export default */ var config_walker = ({
    node: node_namespaceObject
});

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/syntax/index.js





/* export default */ var lib_syntax = (create({
    ...config_lexer,
    ...config_parser,
    ...config_walker
}));

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/index.js













const {
    tokenize: lib_tokenize,
    parse: lib_parse,
    generate: lib_generate,
    lexer: lib_lexer,
    createLexer,

    walk: lib_walk,
    find,
    findLast,
    findAll,

    toPlainObject: lib_toPlainObject,
    fromPlainObject: lib_fromPlainObject,

    fork
} = lib_syntax;

;// CONCATENATED MODULE: ../../node_modules/css-tree/lib/utils/clone.js


function clone(node) {
    const result = {};

    for (const key of Object.keys(node)) {
        let value = node[key];

        if (value) {
            if (Array.isArray(value) || value instanceof List) {
                value = value.map(clone);
            } else if (value.constructor === Object) {
                value = clone(value);
            }
        }

        result[key] = value;
    }

    return result;
}

;// CONCATENATED MODULE: ../../node_modules/pathe/dist/shared/pathe.M-eThtNZ.mjs
let _lazyMatch = () => { var __lib__=(()=>{var m=Object.defineProperty,V=Object.getOwnPropertyDescriptor,G=Object.getOwnPropertyNames,T=Object.prototype.hasOwnProperty,q=(r,e)=>{for(var n in e)m(r,n,{get:e[n],enumerable:true});},H=(r,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of G(e))!T.call(r,t)&&t!==n&&m(r,t,{get:()=>e[t],enumerable:!(a=V(e,t))||a.enumerable});return r},J=r=>H(m({},"__esModule",{value:true}),r),w={};q(w,{default:()=>re});var A=r=>Array.isArray(r),d=r=>typeof r=="function",Q=r=>r.length===0,W=r=>typeof r=="number",K=r=>typeof r=="object"&&r!==null,X=r=>r instanceof RegExp,b=r=>typeof r=="string",h=r=>r===void 0,Y=r=>{const e=new Map;return n=>{const a=e.get(n);if(a)return a;const t=r(n);return e.set(n,t),t}},rr=(r,e,n={})=>{const a={cache:{},input:r,index:0,indexMax:0,options:n,output:[]};if(v(e)(a)&&a.index===r.length)return a.output;throw new Error(`Failed to parse at index ${a.indexMax}`)},i=(r,e)=>A(r)?er(r,e):b(r)?ar(r,e):nr(r,e),er=(r,e)=>{const n={};for(const a of r){if(a.length!==1)throw new Error(`Invalid character: "${a}"`);const t=a.charCodeAt(0);n[t]=true;}return a=>{const t=a.index,o=a.input;for(;a.index<o.length&&o.charCodeAt(a.index)in n;)a.index+=1;const u=a.index;if(u>t){if(!h(e)&&!a.options.silent){const s=a.input.slice(t,u),c=d(e)?e(s,o,String(t)):e;h(c)||a.output.push(c);}a.indexMax=Math.max(a.indexMax,a.index);}return  true}},nr=(r,e)=>{const n=r.source,a=r.flags.replace(/y|$/,"y"),t=new RegExp(n,a);return g(o=>{t.lastIndex=o.index;const u=t.exec(o.input);if(u){if(!h(e)&&!o.options.silent){const s=d(e)?e(...u,o.input,String(o.index)):e;h(s)||o.output.push(s);}return o.index+=u[0].length,o.indexMax=Math.max(o.indexMax,o.index),true}else return  false})},ar=(r,e)=>n=>{if(n.input.startsWith(r,n.index)){if(!h(e)&&!n.options.silent){const t=d(e)?e(r,n.input,String(n.index)):e;h(t)||n.output.push(t);}return n.index+=r.length,n.indexMax=Math.max(n.indexMax,n.index),true}else return  false},C=(r,e,n,a)=>{const t=v(r);return g(_(M(o=>{let u=0;for(;u<n;){const s=o.index;if(!t(o)||(u+=1,o.index===s))break}return u>=e})))},tr=(r,e)=>C(r,0,1),f=(r,e)=>C(r,0,1/0),x=(r,e)=>{const n=r.map(v);return g(_(M(a=>{for(let t=0,o=n.length;t<o;t++)if(!n[t](a))return  false;return  true})))},l=(r,e)=>{const n=r.map(v);return g(_(a=>{for(let t=0,o=n.length;t<o;t++)if(n[t](a))return  true;return  false}))},M=(r,e=false)=>{const n=v(r);return a=>{const t=a.index,o=a.output.length,u=n(a);return (!u||e)&&(a.index=t,a.output.length!==o&&(a.output.length=o)),u}},_=(r,e)=>{const n=v(r);return n},g=(()=>{let r=0;return e=>{const n=v(e),a=r+=1;return t=>{var o;if(t.options.memoization===false)return n(t);const u=t.index,s=(o=t.cache)[a]||(o[a]=new Map),c=s.get(u);if(c===false)return  false;if(W(c))return t.index=c,true;if(c)return t.index=c.index,c.output?.length&&t.output.push(...c.output),true;{const Z=t.output.length;if(n(t)){const D=t.index,U=t.output.length;if(U>Z){const ee=t.output.slice(Z,U);s.set(u,{index:D,output:ee});}else s.set(u,D);return  true}else return s.set(u,false),false}}}})(),E=r=>{let e;return n=>(e||(e=v(r())),e(n))},v=Y(r=>{if(d(r))return Q(r)?E(r):r;if(b(r)||X(r))return i(r);if(A(r))return x(r);if(K(r))return l(Object.values(r));throw new Error("Invalid rule")}),P="abcdefghijklmnopqrstuvwxyz",ir=r=>{let e="";for(;r>0;){const n=(r-1)%26;e=P[n]+e,r=Math.floor((r-1)/26);}return e},O=r=>{let e=0;for(let n=0,a=r.length;n<a;n++)e=e*26+P.indexOf(r[n])+1;return e},S=(r,e)=>{if(e<r)return S(e,r);const n=[];for(;r<=e;)n.push(r++);return n},or=(r,e,n)=>S(r,e).map(a=>String(a).padStart(n,"0")),R=(r,e)=>S(O(r),O(e)).map(ir),p=r=>r,z=r=>ur(e=>rr(e,r,{memoization:false}).join("")),ur=r=>{const e={};return n=>e[n]??(e[n]=r(n))},sr=i(/^\*\*\/\*$/,".*"),cr=i(/^\*\*\/(\*)?([ a-zA-Z0-9._-]+)$/,(r,e,n)=>`.*${e?"":"(?:^|/)"}${n.replaceAll(".","\\.")}`),lr=i(/^\*\*\/(\*)?([ a-zA-Z0-9._-]*)\{([ a-zA-Z0-9._-]+(?:,[ a-zA-Z0-9._-]+)*)\}$/,(r,e,n,a)=>`.*${e?"":"(?:^|/)"}${n.replaceAll(".","\\.")}(?:${a.replaceAll(",","|").replaceAll(".","\\.")})`),y=i(/\\./,p),pr=i(/[$.*+?^(){}[\]\|]/,r=>`\\${r}`),vr=i(/./,p),hr=i(/^(?:!!)*!(.*)$/,(r,e)=>`(?!^${L(e)}$).*?`),dr=i(/^(!!)+/,""),fr=l([hr,dr]),xr=i(/\/(\*\*\/)+/,"(?:/.+/|/)"),gr=i(/^(\*\*\/)+/,"(?:^|.*/)"),mr=i(/\/(\*\*)$/,"(?:/.*|$)"),_r=i(/\*\*/,".*"),j=l([xr,gr,mr,_r]),Sr=i(/\*\/(?!\*\*\/)/,"[^/]*/"),yr=i(/\*/,"[^/]*"),N=l([Sr,yr]),k=i("?","[^/]"),$r=i("[",p),wr=i("]",p),Ar=i(/[!^]/,"^/"),br=i(/[a-z]-[a-z]|[0-9]-[0-9]/i,p),Cr=i(/[$.*+?^(){}[\|]/,r=>`\\${r}`),Mr=i(/[^\]]/,p),Er=l([y,Cr,br,Mr]),B=x([$r,tr(Ar),f(Er),wr]),Pr=i("{","(?:"),Or=i("}",")"),Rr=i(/(\d+)\.\.(\d+)/,(r,e,n)=>or(+e,+n,Math.min(e.length,n.length)).join("|")),zr=i(/([a-z]+)\.\.([a-z]+)/,(r,e,n)=>R(e,n).join("|")),jr=i(/([A-Z]+)\.\.([A-Z]+)/,(r,e,n)=>R(e.toLowerCase(),n.toLowerCase()).join("|").toUpperCase()),Nr=l([Rr,zr,jr]),I=x([Pr,Nr,Or]),kr=i("{","(?:"),Br=i("}",")"),Ir=i(",","|"),Fr=i(/[$.*+?^(){[\]\|]/,r=>`\\${r}`),Lr=i(/[^}]/,p),Zr=E(()=>F),Dr=l([j,N,k,B,I,Zr,y,Fr,Ir,Lr]),F=x([kr,f(Dr),Br]),Ur=f(l([sr,cr,lr,fr,j,N,k,B,I,F,y,pr,vr])),Vr=Ur,Gr=z(Vr),L=Gr,Tr=i(/\\./,p),qr=i(/./,p),Hr=i(/\*\*\*+/,"*"),Jr=i(/([^/{[(!])\*\*/,(r,e)=>`${e}*`),Qr=i(/(^|.)\*\*(?=[^*/)\]}])/,(r,e)=>`${e}*`),Wr=f(l([Tr,Hr,Jr,Qr,qr])),Kr=Wr,Xr=z(Kr),Yr=Xr,$=(r,e)=>{const n=Array.isArray(r)?r:[r];if(!n.length)return  false;const a=n.map($.compile),t=n.every(s=>/(\/(?:\*\*)?|\[\/\])$/.test(s)),o=e.replace(/[\\\/]+/g,"/").replace(/\/$/,t?"/":"");return a.some(s=>s.test(o))};$.compile=r=>new RegExp(`^${L(Yr(r))}$`,"s");var re=$;return J(w)})();
 return __lib__.default || __lib__; };
let _match;
const zeptomatch = (path, pattern) => {
  if (!_match) {
    _match = _lazyMatch();
    _lazyMatch = null;
  }
  return _match(path, pattern);
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}

const _UNC_REGEX = /^[/\\]{2}/;
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
const _EXTNAME_RE = /.(\.[^./]+|\.)$/;
const _PATH_ROOT_RE = /^[/\\]|^[a-zA-Z]:[/\\]/;
const sep = "/";
const normalize = function(path) {
  if (path.length === 0) {
    return ".";
  }
  path = normalizeWindowsPath(path);
  const isUNCPath = path.match(_UNC_REGEX);
  const isPathAbsolute = isAbsolute(path);
  const trailingSeparator = path[path.length - 1] === "/";
  path = normalizeString(path, !isPathAbsolute);
  if (path.length === 0) {
    if (isPathAbsolute) {
      return "/";
    }
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) {
    path += "/";
  }
  if (_DRIVE_LETTER_RE.test(path)) {
    path += "/";
  }
  if (isUNCPath) {
    if (!isPathAbsolute) {
      return `//./${path}`;
    }
    return `//${path}`;
  }
  return isPathAbsolute && !isAbsolute(path) ? `/${path}` : path;
};
const join = function(...segments) {
  let path = "";
  for (const seg of segments) {
    if (!seg) {
      continue;
    }
    if (path.length > 0) {
      const pathTrailing = path[path.length - 1] === "/";
      const segLeading = seg[0] === "/";
      const both = pathTrailing && segLeading;
      if (both) {
        path += seg.slice(1);
      } else {
        path += pathTrailing || segLeading ? seg : `/${seg}`;
      }
    } else {
      path += seg;
    }
  }
  return normalize(path);
};
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const toNamespacedPath = function(p) {
  return normalizeWindowsPath(p);
};
const extname = function(p) {
  if (p === "..") return "";
  const match = _EXTNAME_RE.exec(normalizeWindowsPath(p));
  return match && match[1] || "";
};
const relative = function(from, to) {
  const _from = resolve(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
  const _to = resolve(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
  if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) {
    return _to.join("/");
  }
  const _fromCopy = [..._from];
  for (const segment of _fromCopy) {
    if (_to[0] !== segment) {
      break;
    }
    _from.shift();
    _to.shift();
  }
  return [..._from.map(() => ".."), ..._to].join("/");
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const format = function(p) {
  const ext = p.ext ? p.ext.startsWith(".") ? p.ext : `.${p.ext}` : "";
  const segments = [p.root, p.dir, p.base ?? (p.name ?? "") + ext].filter(
    Boolean
  );
  return normalizeWindowsPath(
    p.root ? resolve(...segments) : segments.join("/")
  );
};
const basename = function(p, extension) {
  const segments = normalizeWindowsPath(p).split("/");
  let lastSegment = "";
  for (let i = segments.length - 1; i >= 0; i--) {
    const val = segments[i];
    if (val) {
      lastSegment = val;
      break;
    }
  }
  return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};
const pathe_M_eThtNZ_parse = function(p) {
  const root = _PATH_ROOT_RE.exec(p)?.[0]?.replace(/\\/g, "/") || "";
  const base = basename(p);
  const extension = extname(base);
  return {
    root,
    dir: dirname(p),
    base,
    ext: extension,
    name: base.slice(0, base.length - extension.length)
  };
};
const matchesGlob = (path, pattern) => {
  return zeptomatch(pattern, normalize(path));
};

const _path = {
  __proto__: null,
  basename: basename,
  dirname: dirname,
  extname: extname,
  format: format,
  isAbsolute: isAbsolute,
  join: join,
  matchesGlob: matchesGlob,
  normalize: normalize,
  normalizeString: normalizeString,
  parse: pathe_M_eThtNZ_parse,
  relative: relative,
  resolve: resolve,
  sep: sep,
  toNamespacedPath: toNamespacedPath
};



;// CONCATENATED MODULE: ../../node_modules/pathe/dist/index.mjs



const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = { posix: void 0, win32: void 0 };
const dist_mix = (del = delimiter) => {
  return new Proxy(_path, {
    get(_, prop) {
      if (prop === "delimiter") return del;
      if (prop === "posix") return posix;
      if (prop === "win32") return win32;
      return _platforms[prop] || _path[prop];
    }
  });
};
const posix = /* @__PURE__ */ dist_mix(":");
const win32 = /* @__PURE__ */ dist_mix(";");



;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/generateHref.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

/**
 * `@import` href resolution, without `node:path`.
 *
 * This module used to `import path from 'node:path'`. Because `parse` imports
 * `generateHref`, that single import made the whole package impossible to bundle
 * for a browser, and the package exposes no subpath exports to import around it.
 * `pathe` provides the four functions this file needs - `join`, `resolve`,
 * `relative` and `isAbsolute` - and works in both a browser bundle and Node.
 *
 * ## What is unchanged, and what is not
 *
 * For a path that contains no backslash, `pathe` is byte-identical to
 * `path.posix`, which is what `node:path`'s default export already was on every
 * non-Windows platform. Since `parse` defaults `projectRoot` to `'/'` and every
 * in-repo caller passes POSIX paths, href resolution is unchanged in this tree.
 * `test/generateHref.test.ts` proves that against `node:path` itself over a
 * generated matrix.
 *
 * A path that *does* contain a backslash is where `pathe` differs, because it
 * treats `\` as a separator by design:
 *
 * - `'\a.css'` is an absolute path, not a filename starting with a backslash.
 * - `'C:\x.css'` has a drive letter, so `C:` is a path segment rather than part
 *   of a filename.
 * - `'\\srv\share'` is a UNC-shaped path.
 *
 * That is neither `path.posix` (which treats `\` as an ordinary character) nor
 * exactly `path.win32` (which differs again on UNC and on a leading `\`). The
 * behaviour these inputs get is pinned in `test/generateHref.test.ts` rather
 * than described here, so it cannot drift silently.
 *
 * ## `process.cwd()` still participates
 *
 * `pathe`'s `resolve` falls back to `process.cwd()` for a relative input, exactly
 * as `node:path` did, so a relative `projectRoot` still makes the output depend
 * on where the build ran from. Nothing in this tree observes it: `parse` defaults
 * `projectRoot` to `'/'` and every in-repo caller passes an absolute one.
 *
 * A handful of *absolute* roots also reach that fallback, because `pathe`
 * normalises them into a UNC shape that its own `isAbsolute` then rejects:
 * `'//'`, `'//.'`, `'//./x'` and `'\'`, when combined with a `.`-prefixed
 * filename. Those are pinned in `test/generateHref.test.ts`; they are not shapes
 * a caller passes, and a browser bundle has no `process.cwd()` at all.
 */
function getFullPath(projectRoot, filename, importStmt) {
    let fullPath = '';
    if (importStmt.startsWith('/')) {
        fullPath = posix.join(projectRoot, importStmt);
    }
    else if (importStmt.startsWith('@')) {
        fullPath = importStmt;
    }
    else {
        fullPath = posix.resolve(filename, '..', importStmt);
    }
    return fullPath;
}
function generateHref(projectRoot, filename, origin) {
    filename = posix.isAbsolute(filename)
        ? filename
        : posix.join(projectRoot, filename);
    const fullPath = getFullPath(projectRoot, filename, origin);
    let projectPath = posix.relative(projectRoot, fullPath);
    if (fullPath.startsWith('@')) {
        return normalizeSlashes(fullPath);
    }
    else if (!projectPath.startsWith('.')) {
        projectPath = posix.join(POSIX_SEP, projectPath);
    }
    return normalizeSlashes(projectPath);
}
/** `path.posix.sep`. */
const POSIX_SEP = '/';
/** `path.win32.sep`, kept out of shipped hrefs. */
const WIN32_SEP = '\\';
function normalizeSlashes(file) {
    return file.replaceAll(WIN32_SEP, '/');
}
//# sourceMappingURL=generateHref.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/toLoc.js
function toLoc(cssTreeLoc, columnOffset = 0) {
    return {
        line: cssTreeLoc.line,
        column: cssTreeLoc.column + columnOffset,
    };
}
//# sourceMappingURL=toLoc.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/toString.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/

function toString_toString(node) {
    return lib_generate(node);
}
//# sourceMappingURL=toString.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/types/Plugin.js
var Plugin_Severity;
(function (Severity) {
    Severity[Severity["Error"] = 0] = "Error";
    Severity[Severity["Warning"] = 1] = "Warning";
    Severity[Severity["Unused"] = 2] = "Unused";
    Severity[Severity["NotSupport"] = 3] = "NotSupport";
    Severity[Severity["Deprecated"] = 4] = "Deprecated";
    Severity[Severity["Experimental"] = 5] = "Experimental";
})(Plugin_Severity || (Plugin_Severity = {}));
//# sourceMappingURL=Plugin.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/parse.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/





function transformDeclaration(node, errors) {
    let hasVarFunction = false;
    const defaultValueMap = {};
    lib_walk(node, (node) => {
        if (node.type === 'Function' && node.name === 'var') {
            hasVarFunction = true;
        }
    });
    if (hasVarFunction) {
        let hasDefaultValue = true;
        const valueNode = clone(node);
        lib_walk(valueNode, (node, item) => {
            if (node.type === 'Function' && node.name === 'var') {
                hasVarFunction = true;
                const varFunctionValues = node.children.toArray();
                const varName = varFunctionValues[0]?.type === 'Identifier'
                    ? varFunctionValues[0].name
                    : undefined;
                item.data = {
                    ...node,
                    type: 'Raw',
                    value: ` {{${varName}}}${item.next !== null ? ' ' : ''}`,
                };
            }
        });
        lib_walk(node, (node, item) => {
            if (node.type === 'Function' && node.name === 'var') {
                hasVarFunction = true;
                const varFunctionValues = node.children.toArray();
                const varName = varFunctionValues[0]?.type === 'Identifier'
                    ? varFunctionValues[0].name
                    : undefined;
                const firstOperator = varFunctionValues[1]?.type === 'Operator'
                    ? varFunctionValues[1].value
                    : undefined;
                const varDefaultValueNode = varFunctionValues[2];
                /**
                 * check if it is nested var
                 */
                const location = `${node.loc.source}@${node.loc.end.line}:${node.loc.end.column}`;
                if (varDefaultValueNode) {
                    let hasNestedVar = false;
                    lib_walk(varDefaultValueNode, (node) => {
                        if (node.type === 'Function' && node.name === 'var') {
                            hasNestedVar = true;
                        }
                    });
                    if (hasNestedVar) {
                        errors.push({
                            name: 'nested var',
                            severity: Plugin_Severity.Error,
                            message: `nested var() is not allowed in Lynx`,
                            range: node.loc,
                        });
                    }
                }
                if (!varName || (firstOperator && firstOperator !== ',')) {
                    throw new Error(`illegal css value ${toString_toString(node)} ${location}`);
                }
                if (varDefaultValueNode) {
                    const currentDefaultValueText = toString_toString(varDefaultValueNode);
                    defaultValueMap[varName] = currentDefaultValueText;
                    item.data = {
                        ...node,
                        type: 'Raw',
                        value: currentDefaultValueText,
                    };
                }
                else {
                    hasDefaultValue = false;
                    defaultValueMap[varName] = '';
                }
            }
        });
        return {
            type: 'css_var',
            name: node.property,
            value: toString_toString(valueNode.value).trim()
                + (node.important ? ' !important' : ''),
            defaultValue: hasDefaultValue ? toString_toString(node.value).trim() : '',
            defaultValueMap,
            keyLoc: toLoc(node.loc.start, node.property.length),
            valLoc: toLoc(node.value.loc.end, 1),
        };
    }
    else {
        return {
            name: node.property,
            value: toString_toString(node.value) + (node.important ? ' !important' : ''),
            keyLoc: toLoc(node.loc.start, node.property.length),
            valLoc: toLoc(node.value.loc.end, 1),
        };
    }
}
function transformVariables(block) {
    return Object.fromEntries(block.children.toArray().filter((node) => {
        return node.type === 'Declaration' && node.property.startsWith('--');
    }).map((node) => {
        const declaration = node;
        return [
            declaration.property,
            toString_toString(declaration.value)
                + (declaration.important ? ' !important' : ''),
        ];
    }));
}
function transformStyleRule(node, errors) {
    const preludeText = toString_toString(node.prelude);
    return {
        type: 'StyleRule',
        style: transformBlock(node.block, errors),
        selectorText: {
            value: preludeText,
            loc: toLoc(node.prelude.loc.end),
        },
        variables: transformVariables(node.block),
    };
}
function transformAtRuleContent(block, errors, options) {
    if (!block)
        return [];
    const rules = [];
    for (const child of block.children.toArray()) {
        if (child.type === 'Rule') {
            rules.push(transformStyleRule(child, errors));
        }
        else if (child.type === 'Atrule') {
            // Handle nested at-rules
            if (child.name === 'media') {
                const preludeText = child.prelude ? toString_toString(child.prelude) : '';
                rules.push({
                    type: 'MediaRule',
                    prelude: {
                        value: preludeText,
                        loc: child.prelude
                            ? toLoc(child.prelude.loc.end)
                            : toLoc(child.loc.start),
                    },
                    rules: transformAtRuleContent(child.block, errors, options),
                });
            }
            else if (child.name === 'supports') {
                const preludeText = child.prelude ? toString_toString(child.prelude) : '';
                rules.push({
                    type: 'SupportsRule',
                    prelude: {
                        value: preludeText,
                        loc: child.prelude
                            ? toLoc(child.prelude.loc.end)
                            : toLoc(child.loc.start),
                    },
                    rules: transformAtRuleContent(child.block, errors, options),
                });
            }
            else if (child.name === 'layer') {
                const preludeText = child.prelude ? toString_toString(child.prelude) : '';
                const layerRule = {
                    type: 'LayerRule',
                    rules: transformAtRuleContent(child.block, errors, options),
                };
                if (preludeText) {
                    layerRule.prelude = {
                        value: preludeText,
                        loc: child.prelude
                            ? toLoc(child.prelude.loc.end)
                            : toLoc(child.loc.start),
                    };
                }
                rules.push(layerRule);
            }
        }
    }
    return rules;
}
function transformBlock(block, errors) {
    const declarations = block.children.toArray().filter((node) => {
        return node.type === 'Declaration' && !node.property.startsWith('--');
    });
    return declarations.map((e) => transformDeclaration(e, errors));
}
function dist_parse_parse(content, options = {}) {
    const errors = [];
    const result = [];
    const report = (error) => errors.push(error);
    const { filename = './index.css', projectRoot = '/', plugins = [] } = options;
    const ast = lib_parse(content, {
        parseValue: true,
        parseAtrulePrelude: true,
        parseCustomProperty: true,
        parseRulePrelude: true,
        positions: true,
        filename,
    });
    for (const plugin of plugins) {
        plugin.phaseStandard?.(ast, {
            report,
        });
    }
    lib_walk(ast, {
        enter: function (node, item, list) {
            if (node.type === 'Url') {
                item.data = {
                    ...node,
                    type: 'Raw',
                    value: `url('${node.value}')`,
                };
            }
            else if (node.type === 'Comment') {
                list.remove(item);
            }
            else if (node.type === 'Rule') {
                const parent = node;
                node.block?.children.filter(node => node.type === 'Raw').forEach((child, childItem, childList) => {
                    childList.remove(childItem);
                    const childAst = lib_parse(child.value, {
                        positions: true,
                        ...child.loc?.start,
                    });
                    lib_walk(childAst, (subParseChild, subParseChildItem) => {
                        if (subParseChild.type === 'Rule') {
                            if (subParseChild.prelude.type === 'SelectorList'
                                && parent.prelude.type === 'SelectorList') {
                                const parentSelectorList = parent.prelude
                                    .children;
                                subParseChild.prelude.children.forEach((selector) => {
                                    selector.children.prependData({
                                        ...selector,
                                        type: 'WhiteSpace',
                                        value: ' ',
                                    });
                                    selector.children.prependList(parentSelectorList.copy());
                                });
                            }
                            item.next
                                ? list.insert(subParseChildItem, item.next)
                                : list.append(subParseChildItem);
                        }
                    });
                });
            }
        },
    });
    lib_walk(ast, {
        enter: function (node) {
            if (node.type === 'Atrule') {
                if (node.name === 'font-face') {
                    result.push({
                        type: 'FontFaceRule',
                        style: transformBlock(node.block, errors),
                    });
                    return this.skip;
                }
                else if (node.name === 'keyframes') {
                    if (!node.block) {
                        report({
                            severity: Plugin_Severity.Error,
                            name: 'illegal',
                            message: `illegal keyframes at ${options.filename}`,
                            range: {
                                start: toLoc(node.loc.start),
                                end: toLoc(node.loc.end),
                            },
                        });
                        return;
                    }
                    result.push({
                        type: 'KeyframesRule',
                        name: {
                            value: node.prelude ? toString_toString(node.prelude) : '',
                            loc: node.prelude
                                ? toLoc(node.prelude.loc.end)
                                : toLoc(node.loc.start),
                        },
                        styles: node.block.children.toArray().filter(node => node.type === 'Rule').map(rule => {
                            const preludeText = toString_toString(rule.prelude);
                            return {
                                keyText: {
                                    value: preludeText,
                                    loc: toLoc(rule.prelude.loc.start, preludeText.length),
                                },
                                variables: transformVariables(rule.block),
                                style: transformBlock(rule.block, errors),
                            };
                        }),
                    });
                    return this.skip;
                }
                else if (node.name === 'import') {
                    let origin = '';
                    if (node.prelude) {
                        if (node.prelude.type === 'AtrulePrelude'
                            && node.prelude.children.first?.type === 'Url') {
                            origin = node.prelude.children.first.value;
                        }
                        else {
                            const str = toString_toString(node.prelude);
                            if (str.startsWith('url(')) {
                                origin = str.substring(5, str.length - 2);
                            }
                            else {
                                origin = JSON.parse(str);
                            }
                        }
                    }
                    result.push({
                        type: 'ImportRule',
                        origin,
                        href: generateHref(projectRoot, filename, origin),
                    });
                    return this.skip;
                }
                else if (node.name === 'media') {
                    const preludeText = node.prelude ? toString_toString(node.prelude) : '';
                    result.push({
                        type: 'MediaRule',
                        prelude: {
                            value: preludeText,
                            loc: node.prelude
                                ? toLoc(node.prelude.loc.end)
                                : toLoc(node.loc.start),
                        },
                        rules: transformAtRuleContent(node.block, errors, {
                            filename,
                            projectRoot,
                        }),
                    });
                    return this.skip;
                }
                else if (node.name === 'supports') {
                    const preludeText = node.prelude ? toString_toString(node.prelude) : '';
                    result.push({
                        type: 'SupportsRule',
                        prelude: {
                            value: preludeText,
                            loc: node.prelude
                                ? toLoc(node.prelude.loc.end)
                                : toLoc(node.loc.start),
                        },
                        rules: transformAtRuleContent(node.block, errors, {
                            filename,
                            projectRoot,
                        }),
                    });
                    return this.skip;
                }
                else if (node.name === 'layer') {
                    const preludeText = node.prelude ? toString_toString(node.prelude) : '';
                    const layerRule = {
                        type: 'LayerRule',
                        rules: transformAtRuleContent(node.block, errors, {
                            filename,
                            projectRoot,
                        }),
                    };
                    if (preludeText) {
                        layerRule.prelude = {
                            value: preludeText,
                            loc: node.prelude
                                ? toLoc(node.prelude.loc.end)
                                : toLoc(node.loc.start),
                        };
                    }
                    result.push(layerRule);
                    return this.skip;
                }
                return this.skip;
            }
            else if (node.type === 'Rule') {
                result.push(transformStyleRule(node, errors));
                return this.skip;
            }
        },
    });
    return {
        root: result,
        errors,
    };
}
//# sourceMappingURL=parse.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/css/ast.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

function ast_cssToAst(content, plugins) {
    const parsedCSS = parse(content, {
        plugins,
    });
    return [parsedCSS.root, parsedCSS.errors];
}
//# sourceMappingURL=ast.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/css/cssChunksToMap.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.


/**
 * Convert CSS chunks into `cssMap` / `cssSource`.
 *
 * `loc` fields remain in bundle CSS coordinates so they can be resolved later
 * via `main.css.map`.
 *
 * `cssSource` intentionally keeps the historical `/cssId/<id>.css` shape.
 */
function cssChunksToMap(cssChunks, plugins, enableCSSSelector) {
    const cssMap = cssChunks
        .reduce((cssMap, cssChunk) => {
        const normalizedCSSChunk = normalizeCSSChunk(cssChunk);
        const debundledMap = new Map();
        debundleCSS(normalizedCSSChunk.content, debundledMap, enableCSSSelector, true);
        debundledMap.forEach((content, cssId) => {
            if (!cssMap.has(cssId)) {
                cssMap.set(cssId, []);
            }
            cssMap.get(cssId).push(...content);
        });
        return cssMap;
    }, new Map());
    const stylesheets = Array.from(cssMap.entries()).map(([cssId, content]) => {
        const [root] = cssToAst(content.join('\n'), plugins);
        root.forEach(rule => {
            if (rule.type === 'ImportRule') {
                // For example: '/981029' -> '981029'
                rule.href = rule.href.replace('/', '');
            }
        });
        return {
            cssId,
            root,
            cssSource: `/cssId/${cssId}.css`,
            content,
        };
    });
    return {
        cssMap: Object.fromEntries(stylesheets.map(({ cssId, root }) => [cssId, root])),
        cssSource: Object.fromEntries(stylesheets.map(({ cssId, cssSource }) => [cssId, cssSource])),
        contentMap: cssMap,
    };
}
function normalizeCSSChunk(cssChunk) {
    if (typeof cssChunk === 'string') {
        return {
            content: cssChunk,
        };
    }
    return cssChunk;
}
//# sourceMappingURL=cssChunksToMap.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/css/index.js
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ../../node_modules/@lynx-js/css-serializer/dist/index.js
/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/




//# sourceMappingURL=index.js.map

},
568(__webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var _encode_bg_wasm__rspack_import_0 = __webpack_require__(8065);
/* import */ var _encode_bg_js__rspack_import_1 = __webpack_require__(8676);
var __rspack_async_deps = __rspack_load_async_deps([_encode_bg_wasm__rspack_import_0]);
_encode_bg_wasm__rspack_import_0 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];/* @ts-self-types="./encode.d.ts" */



(0,_encode_bg_js__rspack_import_1/* .__wbg_set_wasm */.lI)(_encode_bg_wasm__rspack_import_0);
_encode_bg_wasm__rspack_import_0.__wbindgen_start();


__webpack_require__.d(__webpack_exports__, {
  MD: () => (/* reexport safe */ _encode_bg_js__rspack_import_1.MD),
  YA: () => (/* reexport safe */ _encode_bg_js__rspack_import_1.YA),
  gv: () => (/* reexport safe */ _encode_bg_js__rspack_import_1.gv),
  jO: () => (/* reexport safe */ _encode_bg_js__rspack_import_1.jO)
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
8676(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
class RawStyleInfo {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawStyleInfoFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawstyleinfo_free(ptr, 0);
    }
    /**
     *
     *   * Appends an import to the stylesheet identified by `css_id`.
     *   * If the stylesheet does not exist, it is created.
     *   * @param css_id - The ID of the CSS file.
     *   * @param import_css_id - The ID of the imported CSS file.
     *
     * @param {number} css_id
     * @param {number} import_css_id
     */
    append_import(css_id, import_css_id) {
        wasm.rawstyleinfo_append_import(this.__wbg_ptr, css_id, import_css_id);
    }
    /**
     *
     *   * Encodes the RawStyleInfo into a Uint8Array using rkyv serialization.
     *   * @returns A Uint8Array containing the serialized RawStyleInfo.
     *
     * @returns {Uint8Array}
     */
    encode() {
        const ret = wasm.rawstyleinfo_encode(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    constructor() {
        const ret = wasm.rawstyleinfo_new();
        this.__wbg_ptr = ret;
        RawStyleInfoFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     *
     *   * Pushes a rule to the stylesheet identified by `css_id`.
     *   * If the stylesheet does not exist, it is created.
     *   * @param css_id - The ID of the CSS file.
     *   * @param rule - The rule to append.
     *
     * @param {number} css_id
     * @param {Rule} rule
     */
    push_rule(css_id, rule) {
        _assertClass(rule, Rule);
        var ptr0 = rule.__destroy_into_raw();
        wasm.rawstyleinfo_push_rule(this.__wbg_ptr, css_id, ptr0);
    }
}
if (Symbol.dispose) RawStyleInfo.prototype[Symbol.dispose] = RawStyleInfo.prototype.free;

class Rule {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RuleFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rule_free(ptr, 0);
    }
    /**
     *
     *   * Creates a new Rule with the specified type.
     *   * @param rule_type - The type of the rule (e.g., "StyleRule", "FontFaceRule", "KeyframesRule").
     *
     * @param {string} rule_type
     */
    constructor(rule_type) {
        const ptr0 = passStringToWasm0(rule_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rule_new(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0];
        RuleFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     *
     *   * Pushes a declaration to the rule's declaration block.
     *   * LynxJS doesn't support !important
     *   * @param property_name - The property name.
     *   * @param value - The property value.
     *
     * @param {string} property_name
     * @param {string} value
     */
    push_declaration(property_name, value) {
        const ptr0 = passStringToWasm0(property_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.rule_push_declaration(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     *
     *   * Pushes a nested rule to the rule.
     *   * @param rule - The nested rule to add.
     *
     * @param {Rule} rule
     */
    push_rule_children(rule) {
        _assertClass(rule, Rule);
        var ptr0 = rule.__destroy_into_raw();
        wasm.rule_push_rule_children(this.__wbg_ptr, ptr0);
    }
    /**
     *
     *   * Sets the prelude for the rule.
     *   * @param prelude - The prelude to set (SelectorList or KeyFramesPrelude).
     *
     * @param {RulePrelude} prelude
     */
    set_prelude(prelude) {
        _assertClass(prelude, RulePrelude);
        var ptr0 = prelude.__destroy_into_raw();
        wasm.rule_set_prelude(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) Rule.prototype[Symbol.dispose] = Rule.prototype.free;

/**
 *
 * * Either SelectorList or KeyFramesPrelude
 * * Depending on the RuleType
 * * If it is SelectorList, then selectors is a list of Selector
 * * If it is KeyFramesPrelude, then selectors has only one selector which is Prelude text, its simple_selectors is empty
 * * If the parent is FontFace, then selectors is empty
 *
 */
class RulePrelude {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RulePreludeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ruleprelude_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.ruleprelude_new();
        this.__wbg_ptr = ret;
        RulePreludeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     *
     *   * Pushes a selector to the list.
     *   * @param selector - The selector to add.
     *
     * @param {Selector} selector
     */
    push_selector(selector) {
        _assertClass(selector, Selector);
        var ptr0 = selector.__destroy_into_raw();
        wasm.ruleprelude_push_selector(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) RulePrelude.prototype[Symbol.dispose] = RulePrelude.prototype.free;

class Selector {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SelectorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_selector_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.selector_new();
        this.__wbg_ptr = ret;
        SelectorFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     *
     *   * Pushes a selector section to the selector.
     *   * @param selector_type - The type of the selector section (e.g., "ClassSelector", "IdSelector").
     *   * @param value - The value of the selector section.
     *
     * @param {string} selector_type
     * @param {string} value
     */
    push_one_selector_section(selector_type, value) {
        const ptr0 = passStringToWasm0(selector_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.selector_push_one_selector_section(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
}
if (Symbol.dispose) Selector.prototype[Symbol.dispose] = Selector.prototype.free;

class StyleInfoDecoder {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StyleInfoDecoderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_styleinfodecoder_free(ptr, 0);
    }
}
if (Symbol.dispose) StyleInfoDecoder.prototype[Symbol.dispose] = StyleInfoDecoder.prototype.free;

/**
 * @param {Uint8Array} buffer
 * @param {string | null | undefined} entry_name
 * @param {boolean} config_enable_css_selector
 * @param {boolean} transform_vw
 * @param {boolean} transform_vh
 * @param {boolean} transform_rem
 * @returns {Uint8Array}
 */
function decode_style_info(buffer, entry_name, config_enable_css_selector, transform_vw, transform_vh, transform_rem) {
    var ptr0 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.decode_style_info(buffer, ptr0, len0, config_enable_css_selector, transform_vw, transform_vh, transform_rem);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {RawStyleInfo} raw_style_info
 * @param {boolean} config_enable_css_selector
 * @param {string | null | undefined} entry_name
 * @param {boolean} transform_vw
 * @param {boolean} transform_vh
 * @param {boolean} transform_rem
 * @returns {Uint8Array}
 */
function encode_legacy_json_generated_raw_style_info(raw_style_info, config_enable_css_selector, entry_name, transform_vw, transform_vh, transform_rem) {
    _assertClass(raw_style_info, RawStyleInfo);
    var ptr0 = raw_style_info.__destroy_into_raw();
    var ptr1 = isLikeNone(entry_name) ? 0 : passStringToWasm0(entry_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.encode_legacy_json_generated_raw_style_info(ptr0, config_enable_css_selector, ptr1, len1, transform_vw, transform_vh, transform_rem);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {Uint8Array} buffer
 * @returns {string}
 */
function get_font_face_content(buffer) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.get_font_face_content(buffer);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {Uint8Array} buffer
 * @returns {string}
 */
function get_style_content(buffer) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.get_style_content(buffer);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}
function __wbg_Error_92b29b0548f8b746(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
}
function __wbg___wbindgen_debug_string_c25d447a39f5578f(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
function __wbg___wbindgen_throw_344f42d3211c4765(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
function __wbg_length_1f0964f4a5e2c6d8(arg0) {
    const ret = arg0.length;
    return ret;
}
function __wbg_new_from_slice_77cdfb7977362f3c(arg0, arg1) {
    const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
    return ret;
}
function __wbg_prototypesetcall_4770620bbe4688a0(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}
function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
const RawStyleInfoFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawstyleinfo_free(ptr, 1));
const RuleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rule_free(ptr, 1));
const RulePreludeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_ruleprelude_free(ptr, 1));
const SelectorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_selector_free(ptr, 1));
const StyleInfoDecoderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_styleinfodecoder_free(ptr, 1));

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;


let wasm;
function __wbg_set_wasm(val) {
    wasm = val;
}

__webpack_require__.d(__webpack_exports__, {
  BV: () => (__wbg_new_from_slice_77cdfb7977362f3c),
  F6: () => (__wbg___wbindgen_throw_344f42d3211c4765),
  MD: () => (Selector),
  Pt: () => (__wbg_length_1f0964f4a5e2c6d8),
  YA: () => (RawStyleInfo),
  bL: () => (__wbindgen_init_externref_table),
  gv: () => (RulePrelude),
  j4: () => (__wbg_Error_92b29b0548f8b746),
  jO: () => (Rule),
  lI: () => (__wbg_set_wasm),
  m0: () => (__wbg___wbindgen_debug_string_c25d447a39f5578f),
  pe: () => (__wbg_prototypesetcall_4770620bbe4688a0)
});


},
3331(__unused_rspack___webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
const commentStart = '<!--';
const commentEnd = '-->';
const cdataStart = '<![CDATA[';
const lynxDoctype = '<!doctype lynx>';
const lynxRootClosingTag = '</lynx>';
const utf8ByteOrderMark = '\uFEFF';
/**
 * The whitespace set of the reference implementation. Note that this is narrower than
 * what `String.prototype.trim` considers whitespace, therefore all trimming in
 * this module goes through {@link trimASCIIWhitespace}.
 */
function isASCIIWhitespace(value) {
    return value === ' ' || value === '\t' || value === '\n' || value === '\r'
        || value === '\f';
}
function trimASCIIWhitespace(value) {
    let start = 0;
    let end = value.length;
    while (start < end && isASCIIWhitespace(value[start])) {
        start++;
    }
    while (end > start && isASCIIWhitespace(value[end - 1])) {
        end--;
    }
    return value.slice(start, end);
}
function isOpeningTag(source, position, tagName) {
    if (position >= source.length || source[position] !== '<'
        || !source.startsWith(tagName, position + 1)) {
        return false;
    }
    const boundary = position + tagName.length + 1;
    return boundary < source.length
        && (source[boundary] === '>' || isASCIIWhitespace(source[boundary]));
}
/**
 * Matches exactly one quoted attribute, optionally with a specific value.
 */
function isQuotedAttribute(attributes, attributeName, expectedValue) {
    if (attributes.length === 0) {
        return false;
    }
    if (!attributes.startsWith(attributeName)) {
        return false;
    }
    let rest = trimASCIIWhitespace(attributes.slice(attributeName.length));
    if (rest.length === 0 || rest[0] !== '=') {
        return false;
    }
    rest = trimASCIIWhitespace(rest.slice(1));
    const quote = rest[0];
    if (rest.length < 3 || (quote !== '"' && quote !== '\'')) {
        return false;
    }
    const closingQuote = rest.indexOf(quote, 1);
    if (closingQuote !== rest.length - 1 || closingQuote <= 1) {
        return false;
    }
    return expectedValue === undefined
        || rest.slice(1, closingQuote) === expectedValue;
}
function isEngineVersionAttribute(attributes) {
    return isQuotedAttribute(attributes, 'engine-version');
}
function isThreadAttribute(attributes, thread) {
    return isQuotedAttribute(attributes, 'thread', thread);
}
class LynxXMLParser {
    #source;
    #position = 0;
    #style;
    #mainThreadScript;
    #backgroundThreadScript;
    #rootClosed = false;
    #error;
    constructor(source) {
        this.#source = source;
    }
    parse() {
        const source = this.#source;
        if (source.startsWith(utf8ByteOrderMark)) {
            this.#position += utf8ByteOrderMark.length;
        }
        if (!this.#consumeIgnorable()) {
            return this.#result();
        }
        if (source.startsWith('<!', this.#position)) {
            if (!this.#consumeDoctype()) {
                return this.#result();
            }
            if (!this.#consumeIgnorable()) {
                return this.#result();
            }
        }
        if (!isOpeningTag(source, this.#position, 'lynx')) {
            this.#fail(this.#position, 'expected \'<lynx engine-version="...">\' root element');
            return this.#result();
        }
        if (!this.#consumeRootStart()) {
            return this.#result();
        }
        for (;;) {
            if (!this.#consumeIgnorable()) {
                return this.#result();
            }
            if (source.startsWith(lynxRootClosingTag, this.#position)) {
                this.#position += lynxRootClosingTag.length;
                this.#rootClosed = true;
                break;
            }
            if (this.#position === source.length) {
                break;
            }
            if (!this.#consumeSection()) {
                return this.#result();
            }
        }
        if (!this.#rootClosed) {
            this.#fail(this.#position, 'missing closing tag \'</lynx>\'');
            return this.#result();
        }
        if (!this.#consumeIgnorable()) {
            return this.#result();
        }
        if (this.#position !== source.length) {
            this.#fail(this.#position, 'unexpected content after \'</lynx>\'');
            return this.#result();
        }
        if (this.#mainThreadScript === undefined) {
            this.#fail(this.#position, 'missing \'<script thread="main">\' section');
            return this.#result();
        }
        return {
            success: true,
            style: this.#style,
            mainThreadScript: this.#mainThreadScript,
            backgroundThreadScript: this.#backgroundThreadScript,
        };
    }
    /**
     * Skips ASCII whitespace and comments. Comments may appear anywhere an
     * ignorable token is allowed.
     */
    #consumeIgnorable() {
        const source = this.#source;
        for (;;) {
            while (this.#position < source.length
                && isASCIIWhitespace(source[this.#position])) {
                this.#position++;
            }
            if (!source.startsWith(commentStart, this.#position)) {
                return true;
            }
            const foundCommentEnd = source.indexOf(commentEnd, this.#position + commentStart.length);
            if (foundCommentEnd === -1) {
                return this.#fail(this.#position, 'unterminated comment');
            }
            this.#position = foundCommentEnd + commentEnd.length;
        }
    }
    #consumeDoctype() {
        const source = this.#source;
        if (!source.startsWith(lynxDoctype, this.#position)) {
            return this.#fail(this.#position, 'expected \'<!doctype lynx>\'');
        }
        this.#position += lynxDoctype.length;
        return true;
    }
    #consumeRootStart() {
        const source = this.#source;
        const openingTagEnd = source.indexOf('>', this.#position + 1);
        if (openingTagEnd === -1) {
            return this.#fail(this.#position, 'unterminated \'<lynx>\' opening tag');
        }
        const openingTag = trimASCIIWhitespace(source.slice(this.#position + 1, openingTagEnd));
        const tagNameEnd = openingTag.search(/[\t\n\f\r ]/u);
        const attributes = tagNameEnd === -1
            ? ''
            : trimASCIIWhitespace(openingTag.slice(tagNameEnd));
        if (!isEngineVersionAttribute(attributes)) {
            return this.#fail(this.#position, '\'<lynx>\' requires exactly one non-empty \'engine-version\' attribute');
        }
        this.#position = openingTagEnd + 1;
        return true;
    }
    #assignSectionContent(slot, content, contentStart) {
        if (trimASCIIWhitespace(content).startsWith(cdataStart)) {
            return this.#fail(contentStart, 'CDATA sections are not supported');
        }
        slot.assign(content);
        return true;
    }
    #consumeSection() {
        const source = this.#source;
        const sectionStart = this.#position;
        if (source[this.#position] !== '<') {
            return this.#fail(this.#position, 'unexpected content outside a section');
        }
        const openingTagEnd = source.indexOf('>', this.#position + 1);
        if (openingTagEnd === -1) {
            return this.#fail(this.#position, 'unterminated opening tag');
        }
        const openingTag = trimASCIIWhitespace(source.slice(this.#position + 1, openingTagEnd));
        if (openingTag.length === 0 || openingTag[0] === '/') {
            return this.#fail(this.#position, 'unexpected closing tag');
        }
        const tagNameEnd = openingTag.search(/[\t\n\f\r ]/u);
        const tagName = tagNameEnd === -1
            ? openingTag
            : openingTag.slice(0, tagNameEnd);
        const attributes = tagNameEnd === -1
            ? ''
            : trimASCIIWhitespace(openingTag.slice(tagNameEnd));
        let closingTag;
        let slot;
        if (tagName === 'style') {
            if (attributes.length !== 0) {
                return this.#fail(sectionStart, '\'<style>\' does not accept attributes');
            }
            closingTag = '</style>';
            slot = {
                assign: (content) => {
                    this.#style = content;
                },
                isSeen: () => this.#style !== undefined,
            };
        }
        else if (tagName === 'script') {
            closingTag = '</script>';
            if (isThreadAttribute(attributes, 'main')) {
                slot = {
                    assign: (content) => {
                        this.#mainThreadScript = content;
                    },
                    isSeen: () => this.#mainThreadScript !== undefined,
                };
            }
            else if (isThreadAttribute(attributes, 'background')) {
                slot = {
                    assign: (content) => {
                        this.#backgroundThreadScript = content;
                    },
                    isSeen: () => this.#backgroundThreadScript !== undefined,
                };
            }
            else {
                return this.#fail(sectionStart, '\'<script>\' requires exactly one \'thread="main"\' or \'thread="background"\' attribute');
            }
        }
        else {
            return this.#fail(sectionStart, `unsupported top-level tag '<${tagName}>'`);
        }
        if (slot.isSeen()) {
            return this.#fail(sectionStart, `duplicate '<${openingTag}>' section`);
        }
        const contentStart = openingTagEnd + 1;
        const closingTagStart = source.indexOf(closingTag, contentStart);
        if (closingTagStart === -1) {
            return this.#fail(contentStart, `missing closing tag '${closingTag}'`);
        }
        if (!this.#assignSectionContent(slot, source.slice(contentStart, closingTagStart), contentStart)) {
            return false;
        }
        this.#position = closingTagStart + closingTag.length;
        return true;
    }
    #fail(offset, message) {
        this.#error = {
            offset,
            message,
            formattedMessage: `invalid TemplateBundle XML at offset ${offset}: ${message}`,
        };
        return false;
    }
    #result() {
        return {
            success: false,
            error: this.#error ?? {
                offset: this.#position,
                message: 'unknown error',
                formattedMessage: `invalid TemplateBundle XML at offset ${this.#position}: unknown error`,
            },
        };
    }
}
/**
 * Parses a single file Lynx XML markup document into its three source sections.
 *
 * This never throws for malformed input: inspect the `success` discriminant of
 * the returned {@link LynxXMLParseResult} instead.
 *
 * @param source - The whole XML document. A leading UTF-8 BOM is tolerated.
 */
function parseLynxXML(source) {
    return new LynxXMLParser(source).parse();
}
//# sourceMappingURL=parseLynxXML.js.map
__webpack_require__.d(__webpack_exports__, {
  q: () => (parseLynxXML)
});


},
4218(__webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var _lynx_js_css_serializer__rspack_import_0 = __webpack_require__(2577);
/* import */ var _binary_encode_encode_js__rspack_import_1 = __webpack_require__(568);
var __rspack_async_deps = __rspack_load_async_deps([_binary_encode_encode_js__rspack_import_1]);
_binary_encode_encode_js__rspack_import_1 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];

// @ts-ignore

function restoreCSSVarPlaceholders(value, defaultValueMap) {
    return value.replaceAll(/\{\{(--[^}]+)\}\}/g, (_, varName) => {
        const fallback = defaultValueMap?.[varName];
        return fallback
            ? `var(${varName}, ${restoreCSSVarPlaceholders(fallback, defaultValueMap)})`
            : `var(${varName})`;
    });
}
function restoreCSSVarValue(decl) {
    const isCSSVarDecl = 'type' in decl && decl.type === 'css_var';
    return restoreCSSVarPlaceholders(decl.value, isCSSVarDecl ? decl.defaultValueMap : undefined);
}
function encodeCSS(cssMap) {
    const rawStyleInfo = new _binary_encode_encode_js__rspack_import_1/* .RawStyleInfo */.YA();
    for (const [cssId, nodes] of Object.entries(cssMap)) {
        const parsedCssId = Number(cssId);
        if (isNaN(parsedCssId)) {
            throw new Error(`Invalid cssId: ${cssId}. cssId should be a valid number string.`);
        }
        for (const node of nodes) {
            if (node.type === 'ImportRule') {
                const href = node.href.startsWith('/') ? node.href.slice(1) : node.href;
                const importCssId = Number(href);
                if (isNaN(importCssId)) {
                    throw new Error(`Invalid importCssId: ${node.href}. importCssId should be a valid number string.`);
                }
                else {
                    rawStyleInfo.append_import(parsedCssId, importCssId);
                }
            }
            else if (node.type === 'KeyframesRule') {
                const rule = new _binary_encode_encode_js__rspack_import_1/* .Rule */.jO('KeyframesRule');
                const keyframeNamePrelude = new _binary_encode_encode_js__rspack_import_1/* .RulePrelude */.gv();
                const keyFrameNameSelector = new _binary_encode_encode_js__rspack_import_1/* .Selector */.MD();
                const keyFrameName = node.name.value;
                keyFrameNameSelector.push_one_selector_section('UnknownText', keyFrameName);
                keyframeNamePrelude.push_selector(keyFrameNameSelector);
                rule.set_prelude(keyframeNamePrelude);
                for (const keyframesStyle of node.styles) {
                    const keyFrameChildrenRule = new _binary_encode_encode_js__rspack_import_1/* .Rule */.jO('StyleRule');
                    const prelude = new _binary_encode_encode_js__rspack_import_1/* .RulePrelude */.gv();
                    const selector = new _binary_encode_encode_js__rspack_import_1/* .Selector */.MD();
                    selector.push_one_selector_section('UnknownText', keyframesStyle.keyText.value);
                    prelude.push_selector(selector);
                    keyFrameChildrenRule.set_prelude(prelude);
                    for (const [key, value] of Object.entries(keyframesStyle.variables ?? {})) {
                        keyFrameChildrenRule.push_declaration(key, value);
                    }
                    for (const decl of keyframesStyle.style) {
                        keyFrameChildrenRule.push_declaration(decl.name, restoreCSSVarValue(decl));
                    }
                    rule.push_rule_children(keyFrameChildrenRule);
                }
                rawStyleInfo.push_rule(parsedCssId, rule);
            }
            else if (node.type === 'FontFaceRule') {
                const rule = new _binary_encode_encode_js__rspack_import_1/* .Rule */.jO('FontFaceRule');
                for (const decl of node.style) {
                    rule.push_declaration(decl.name, restoreCSSVarValue(decl));
                }
                rawStyleInfo.push_rule(parsedCssId, rule);
            }
            else if (node.type === 'StyleRule') {
                const rule = new _binary_encode_encode_js__rspack_import_1/* .Rule */.jO('StyleRule');
                const prelude = new _binary_encode_encode_js__rspack_import_1/* .RulePrelude */.gv();
                // Parse selectors
                const ast = _lynx_js_css_serializer__rspack_import_0/* .csstree.parse */.qu.qg(`${node.selectorText.value}{ --mocked-declaration:1;}`);
                const selectorList = ast.children.first
                    .prelude;
                for (const selectorNode of selectorList.children
                    .toArray()) {
                    const selector = new _binary_encode_encode_js__rspack_import_1/* .Selector */.MD();
                    for (const child of selectorNode.children.toArray()) {
                        if (child.type === 'AttributeSelector') {
                            selector.push_one_selector_section(child.type, _lynx_js_css_serializer__rspack_import_0/* .csstree.generate */.qu.cM(child));
                            continue;
                        }
                        if (child.type === 'PseudoClassSelector') {
                            selector.push_one_selector_section(child.type, _lynx_js_css_serializer__rspack_import_0/* .csstree.generate */.qu.cM(child).slice(1));
                            continue;
                        }
                        // @ts-expect-error
                        if (!child.name) {
                            throw new Error(`Selector section of type ${child.type} is missing a name/value.`);
                        }
                        selector.push_one_selector_section(child.type, 
                        // @ts-expect-error
                        child.name);
                    }
                    prelude.push_selector(selector);
                }
                rule.set_prelude(prelude);
                // Declarations
                for (const decl of node.style) {
                    rule.push_declaration(decl.name, restoreCSSVarValue(decl));
                }
                // Variables
                for (const [name, value] of Object.entries(node.variables)) {
                    rule.push_declaration(name, value);
                }
                rawStyleInfo.push_rule(parsedCssId, rule);
            }
        }
    }
    return rawStyleInfo.encode();
}
//# sourceMappingURL=encodeCSS.js.map
__webpack_require__.d(__webpack_exports__, {
  eh: () => (encodeCSS)
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
3757(__webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
/* import */ var _encodeCSS_js__rspack_import_0 = __webpack_require__(4218);
/* import */ var _constants_js__rspack_import_1 = __webpack_require__(3077);
var __rspack_async_deps = __rspack_load_async_deps([_encodeCSS_js__rspack_import_0]);
_encodeCSS_js__rspack_import_0 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];

function encodeAsJSON(map) {
    const jsonString = JSON.stringify(map);
    const utf16Array = new Uint16Array(jsonString.length);
    for (let i = 0; i < jsonString.length; i++) {
        utf16Array[i] = jsonString.charCodeAt(i);
    }
    return new Uint8Array(utf16Array.buffer);
}
function encodeStringMap(map) {
    const entries = Object.entries(map);
    const count = entries.length;
    // Calculate size
    let size = 4; // count
    const encoder = new TextEncoder();
    const encodedEntries = [];
    for (const [key, val] of entries) {
        const keyBytes = encoder.encode(key);
        const valBytes = encoder.encode(val);
        encodedEntries.push({ keyBytes, valBytes });
        size += 4 + keyBytes.length + 4 + valBytes.length;
    }
    const buffer = new Uint8Array(size);
    const view = new DataView(buffer.buffer);
    let offset = 0;
    view.setUint32(offset, count, true);
    offset += 4;
    for (const { keyBytes, valBytes } of encodedEntries) {
        view.setUint32(offset, keyBytes.length, true);
        offset += 4;
        buffer.set(keyBytes, offset);
        offset += keyBytes.length;
        view.setUint32(offset, valBytes.length, true);
        offset += 4;
        buffer.set(valBytes, offset);
        offset += valBytes.length;
    }
    return buffer;
}
function encode(tasmJSON) {
    const { styleInfo, manifest, cardType, appType, pageConfig, lepusCode, customSections, } = tasmJSON;
    const encodedStyleInfo = (0,_encodeCSS_js__rspack_import_0/* .encodeCSS */.eh)(styleInfo);
    const encodedManifest = encodeStringMap(manifest);
    const encodedLepusCode = encodeStringMap(lepusCode);
    const encodedCustomSections = encodeAsJSON(customSections);
    const configMap = {};
    configMap['cardType'] = cardType;
    configMap['isLazy'] = appType !== 'card' ? 'true' : 'false';
    for (const [key, value] of Object.entries(pageConfig)) {
        configMap[key] = String(value);
    }
    const encodedConfigurations = encodeAsJSON(configMap);
    const bufferLength = 8 // Magic Header
        + 4 // Version
        /*section label*/
        /*section length*/
        + 4 + 4 + encodedConfigurations.length // Configurations
        + 4 + 4 + encodedStyleInfo.length // Style Info
        + 4 + 4 + encodedLepusCode.length // Lepus Code
        + 4 + 4 + encodedCustomSections.length // Custom Sections
        + 4 + 4 + encodedManifest.length // Manifest
    ;
    // generate final buffer in order
    const buffer = new Uint8Array(bufferLength);
    let offset = 0;
    const dataView = new DataView(buffer.buffer);
    dataView.setUint32(offset, _constants_js__rspack_import_1/* .MagicHeader0 */.Bz, true);
    offset += 4;
    dataView.setUint32(offset, _constants_js__rspack_import_1/* .MagicHeader1 */.ug, true);
    offset += 4;
    // Version
    dataView.setUint32(offset, 1, true);
    offset += 4;
    // Configurations
    dataView.setUint32(offset, _constants_js__rspack_import_1/* .TemplateSectionLabel.Configurations */.eC.Configurations, true); // section label
    offset += 4;
    dataView.setUint32(offset, encodedConfigurations.length, true); // section length
    offset += 4;
    buffer.set(encodedConfigurations, offset);
    offset += encodedConfigurations.length;
    // Lepus Code
    dataView.setUint32(offset, _constants_js__rspack_import_1/* .TemplateSectionLabel.LepusCode */.eC.LepusCode, true); // section label
    offset += 4;
    dataView.setUint32(offset, encodedLepusCode.length, true); // section length
    offset += 4;
    buffer.set(encodedLepusCode, offset);
    offset += encodedLepusCode.length;
    // Custom Sections
    dataView.setUint32(offset, _constants_js__rspack_import_1/* .TemplateSectionLabel.CustomSections */.eC.CustomSections, true); // section label
    offset += 4;
    dataView.setUint32(offset, encodedCustomSections.length, true); // section length
    offset += 4;
    buffer.set(encodedCustomSections, offset);
    offset += encodedCustomSections.length;
    // Style Info
    dataView.setUint32(offset, _constants_js__rspack_import_1/* .TemplateSectionLabel.StyleInfo */.eC.StyleInfo, true); // section label
    offset += 4;
    dataView.setUint32(offset, encodedStyleInfo.length, true); // section length
    offset += 4;
    buffer.set(encodedStyleInfo, offset);
    offset += encodedStyleInfo.length;
    // Manifest
    dataView.setUint32(offset, _constants_js__rspack_import_1/* .TemplateSectionLabel.Manifest */.eC.Manifest, true); // section label
    offset += 4;
    dataView.setUint32(offset, encodedManifest.length, true); // section length
    offset += 4;
    buffer.set(encodedManifest, offset);
    offset += encodedManifest.length;
    return buffer;
}
//# sourceMappingURL=webEncoder.js.map
__webpack_require__.d(__webpack_exports__, {
  l: () => (encode)
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
4730(__webpack_module__, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.a(__webpack_module__, async function (__rspack_load_async_deps, __rspack_async_done) { try {
__webpack_require__.r(__webpack_exports__);
/* import */ var _lynx_js_css_serializer__rspack_import_0 = __webpack_require__(2577);
/* import */ var _common_xml_parseLynxXML_js__rspack_import_1 = __webpack_require__(3331);
/* import */ var _webEncoder_js__rspack_import_2 = __webpack_require__(3757);
var __rspack_async_deps = __rspack_load_async_deps([_webEncoder_js__rspack_import_2]);
_webEncoder_js__rspack_import_2 = (__rspack_async_deps.then ? (await __rspack_async_deps)() : __rspack_async_deps)[0];// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
/**
 * Turns a single file Lynx XML markup document into the input
 * {@link encode} takes, so that a hand-written card can be built into an
 * ordinary `.web.bundle` instead of needing a load-time bypass.
 *
 * The whole point of going through {@link encode} is that the bundle a markup
 * card produces is indistinguishable from the bundle a ReactLynx build produces:
 * same magic header, same sections, same rkyv-encoded `StyleInfo`, and therefore
 * the same decoder on the other side. Nothing downstream has to know the card
 * was hand-written.
 *
 * ## Unsupported at-rules are discarded, deliberately
 *
 * Lynx's binary style format has three rule kinds - `Declaration`, `FontFace`
 * and `KeyFrames` (`raw_style_info.rs`). There is no representation for a
 * conditional group, so `@media`, `@supports` and `@layer` are not Lynx
 * features: a ReactLynx card cannot use them either, on any platform. Discarding
 * them here is what keeps a markup card's capabilities equal to a built card's,
 * rather than giving web-only cards a feature native does not have.
 *
 * `@lynx-js/css-serializer` already discards most of the rest before this module
 * sees anything - `@container`, `@scope`, `@starting-style`, `@property`,
 * `@page`, `@charset`, `@namespace` and anything newer than its dispatch, all
 * with an empty `errors` array. That is the same intent, so this module does not
 * try to recover them; it only makes the outcome visible.
 *
 * Because none of it is an error, the only failure mode would be silence: an
 * author writes `@property --x` and gets a card that renders wrong with nothing
 * to go on. So every discarded at-rule is reported through
 * {@link diagnoseDiscardedAtRules}, once per kind. This module runs inside the
 * build (`@lynx-js/web-core/encode` is Node-only - it loads the `binary/encode`
 * wasm through `node:fs` glue), so the report is a build-time diagnostic and
 * never reaches a production browser runtime; that is why it is unconditional
 * rather than gated on a dev flag, of which this package has none.
 */



/**
 * The `manifest` key a card's background chunk is expected to live under. The
 * bts realm resolves the chunk through `templateCache['/app-service.js']`, see
 * `createChunkLoading`.
 */
const backgroundChunkPath = '/app-service.js';
/**
 * The `styleInfo` css id a card's own (non component scoped) rules live under.
 *
 * A markup card owns exactly one stylesheet, so this is the only id it ever
 * uses - which is also why `@import` cannot mean anything here, see
 * {@link stripUnrepresentable}.
 */
const cardCSSId = '0';
/**
 * The page config a markup card is built with.
 *
 * The values mirror `LynxTemplateBundle::Build()` in the engine, which
 * hard-codes the config for XML bundles rather than reading it from the document
 * - the markup format has no config section: `app_type = CARD`,
 * `front_end_dsl = REACT`, `enable_css_selector = true`,
 * `enable_css_parser = false`, `enable_css_variable = true`,
 * `enable_fiber_arch = true`.
 *
 * The web-only keys have no engine counterpart and follow `buildLynxTemplate()`
 * in `packages/repl`, the established precedent for rendering a hand-written
 * card on web:
 *
 * - `enableRemoveCSSScope: true` - a markup card has a single global stylesheet
 *   and no per-component css scoping, so scoping must not be applied.
 * - `defaultDisplayLinear: false` - **differs from `packages/repl`, which passes
 *   `true`.** The engine is followed instead: `Build()` never sets this field and
 *   the generated `PageConfig` declares `bool default_display_linear_{false}`,
 *   so a native XML bundle renders with `false`. It is also what hand-written
 *   CSS expects, since a document's `flex-direction` / `display: flex` rules
 *   assume web box semantics rather than an implicit linear container.
 * - `defaultOverflowVisible: false` - likewise, `overflow: hidden` is the Lynx
 *   default and hand-written CSS opts in explicitly.
 * - `enableJSDataProcessor: false` - the markup format has no data processor.
 */
const markupPageConfig = {
    enableCSSSelector: 'true',
    enableRemoveCSSScope: 'true',
    defaultDisplayLinear: 'false',
    defaultOverflowVisible: 'false',
    enableJSDataProcessor: 'false',
};
/**
 * The at-rules `css-serializer` turns into nodes. Anything else it drops, so
 * anything else found in the source is reported as `unsupported`.
 */
const parsedAtRules = new Set([
    'media',
    'supports',
    'layer',
    'import',
    'keyframes',
    'font-face',
]);
/**
 * The at-rules that parse but have no rule kind in the binary style format.
 */
const unrepresentableAtRules = new Set(['media', 'supports', 'layer']);
/**
 * Finds every at-rule in `source` that will not survive into the bundle.
 *
 * Needed because the two kinds of loss are invisible from different places: an
 * `@media` node reaches {@link stripUnrepresentable} and can be counted there,
 * but a `@property` never becomes a node at all, so the only way to know it was
 * written is to look at the source. `css-serializer` re-exports the `css-tree`
 * it already depends on, so this costs a parse but no new dependency.
 *
 * Reported at any nesting depth, since a group's contents are dropped with it.
 */
function diagnoseDiscardedAtRules(source) {
    let ast;
    try {
        ast = _lynx_js_css_serializer__rspack_import_0/* .csstree.parse */.qu.qg(source, {
            parseValue: false,
            parseAtrulePrelude: false,
            parseCustomProperty: false,
            parseRulePrelude: false,
            positions: false,
        });
    }
    catch {
        // A stylesheet that will not parse at all is a separate problem, reported by
        // the caller when the conversion itself fails.
        return [];
    }
    const seen = new Map();
    _lynx_js_css_serializer__rspack_import_0/* .csstree.walk */.qu.GG(ast, (node) => {
        if (node.type !== 'Atrule') {
            return;
        }
        const reason = !parsedAtRules.has(node.name)
            ? 'unsupported'
            : unrepresentableAtRules.has(node.name)
                ? 'unrepresentable'
                : undefined;
        if (reason === undefined) {
            return;
        }
        const name = `@${node.name}`;
        if (!seen.has(name)) {
            seen.set(name, { name, reason });
        }
    });
    return [...seen.values()];
}
/**
 * Removes the nodes {@link encode} cannot accept.
 *
 * Two of them, and both would otherwise be worse than a drop:
 *
 * - a group at-rule (`@media` / `@supports` / `@layer`) falls through
 *   `encodeCSS`'s dispatch and is dropped there anyway, silently;
 * - an `@import` whose href is not a numeric css id makes `encodeCSS` **throw**,
 *   which would fail the whole build. A hand-written `@import url("theme.css")`
 *   is exactly that: the tokenized channel can only link one numeric css id to
 *   another, which is a build step's notion, and a markup card owns a single
 *   stylesheet with nothing to link to. So `@import` with a URL is not a Lynx
 *   feature for this format, and is dropped like the rest instead of aborting.
 *
 * Filtering here rather than teaching `encodeCSS` about it keeps the encode path
 * that every ReactLynx build depends on byte for byte unchanged.
 */
function stripUnrepresentable(nodes) {
    let droppedURLImport = false;
    const kept = nodes.filter((node) => {
        if (node.type === 'MediaRule' || node.type === 'SupportsRule'
            || node.type === 'LayerRule') {
            return false;
        }
        if (node.type === 'ImportRule') {
            const href = node.href.startsWith('/') ? node.href.slice(1) : node.href;
            if (isNaN(Number(href))) {
                droppedURLImport = true;
                return false;
            }
        }
        return true;
    });
    return { nodes: kept, droppedURLImport };
}
/**
 * Translates a Lynx XML document into {@link encode}'s input.
 *
 * Returns the parser's structured error instead of throwing, so a caller can
 * report it however it likes.
 */
function xmlToTasmJSON(source) {
    const parsed = (0,_common_xml_parseLynxXML_js__rspack_import_1/* .parseLynxXML */.q)(source);
    if (!parsed.success) {
        return { success: false, message: parsed.error.formattedMessage };
    }
    // A `<style></style>` section that is present but empty yields `''`, which is
    // meaningfully different from an absent section, so test against `undefined`
    // rather than for truthiness.
    const hasStyle = parsed.style !== undefined;
    const discarded = hasStyle
        ? diagnoseDiscardedAtRules(parsed.style)
        : [];
    let styleInfo = {};
    if (hasStyle) {
        const stripped = stripUnrepresentable(_lynx_js_css_serializer__rspack_import_0/* .parse */.qg(parsed.style).root);
        styleInfo = { [cardCSSId]: stripped.nodes };
        if (stripped.droppedURLImport) {
            // Only detectable from the parsed node: whether an `@import` is
            // representable depends on its resolved href, which the source scan in
            // `diagnoseDiscardedAtRules` deliberately does not try to reproduce.
            discarded.push({ name: '@import', reason: 'unresolvable' });
        }
    }
    return {
        success: true,
        tasmJSON: {
            styleInfo,
            // The background source is kept verbatim: `createChunkLoading` runs each
            // bts chunk through `new Function(...paramNames, jsContent)`, which is the
            // web equivalent of the engine's module wrapper, so wrapping here would
            // nest two module functions and hide the source's top-level bindings.
            // Lynx Core still loads the card's fixed app-service entry when the XML
            // omits its optional background script. Keep that syntax optional by
            // registering an empty chunk instead of falling back to an HTTP request.
            manifest: {
                [backgroundChunkPath]: parsed.backgroundThreadScript ?? '',
            },
            cardType: 'react',
            appType: 'card',
            pageConfig: { ...markupPageConfig },
            // The main-thread script rides the card's `root` lepus chunk, which the
            // runtime auto-executes once the section arrives.
            lepusCode: { root: parsed.mainThreadScript },
            // The markup format has no way to carry either.
            customSections: {},
            elementTemplates: {},
        },
        discarded,
    };
}
/**
 * Builds a `.web.bundle` from a Lynx XML markup document.
 *
 * The bytes are an ordinary modern bundle - see the note at the top of the file
 * - so the existing decoder consumes them with no markup-specific handling.
 *
 * Discarded at-rules are reported on the console as well as returned, because
 * the common caller is a build script that would otherwise drop the information
 * on the floor.
 */
function encodeLynxXML(source) {
    const result = xmlToTasmJSON(source);
    if (!result.success) {
        return result;
    }
    for (const { name, reason } of result.discarded) {
        console.warn(reason === 'unrepresentable'
            ? `[lynx-web] ${name} has no representation in the Lynx style format and was dropped from the bundle, along with the rules inside it. It is not supported on any Lynx platform.`
            : reason === 'unsupported'
                ? `[lynx-web] ${name} is not recognised by the Lynx CSS parser and was dropped from the bundle, along with the rules inside it.`
                : `[lynx-web] ${name} with a URL cannot be resolved for a markup card, which owns a single stylesheet, and was dropped from the bundle.`);
    }
    return {
        success: true,
        buffer: (0,_webEncoder_js__rspack_import_2/* .encode */.l)(result.tasmJSON),
        discarded: result.discarded,
    };
}
//# sourceMappingURL=xmlToTasmJSON.js.map
__webpack_require__.d(__webpack_exports__, {
  diagnoseDiscardedAtRules: () => (diagnoseDiscardedAtRules),
  encodeLynxXML: () => (encodeLynxXML),
  xmlToTasmJSON: () => (xmlToTasmJSON)
});

__rspack_async_done();
} catch(e) { __rspack_async_done(e); } });

},
8065(module, exports, __webpack_require__) {
"use strict";
/* import */ var rspack_import_0 = __webpack_require__(8676);
module.exports = __webpack_require__.v(exports, "static/wasm/77fb77f77f.module.wasm", {
"./encode_bg.js": {
"__wbg_length_1f0964f4a5e2c6d8": rspack_import_0/* .__wbg_length_1f0964f4a5e2c6d8 */.Pt,
"__wbg_prototypesetcall_4770620bbe4688a0": rspack_import_0/* .__wbg_prototypesetcall_4770620bbe4688a0 */.pe,
"__wbg_new_from_slice_77cdfb7977362f3c": rspack_import_0/* .__wbg_new_from_slice_77cdfb7977362f3c */.BV,
"__wbg___wbindgen_throw_344f42d3211c4765": rspack_import_0/* .__wbg___wbindgen_throw_344f42d3211c4765 */.F6,
"__wbg_Error_92b29b0548f8b746": rspack_import_0/* .__wbg_Error_92b29b0548f8b746 */.j4,
"__wbg___wbindgen_debug_string_c25d447a39f5578f": rspack_import_0/* .__wbg___wbindgen_debug_string_c25d447a39f5578f */.m0,
"__wbindgen_init_externref_table": rspack_import_0/* .__wbindgen_init_externref_table */.bL
}
});

},

}]);