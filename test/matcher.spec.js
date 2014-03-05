(function() {
	module('Matcher constructor');

	test('should exist and be a function', function() {
		equal(typeof Matcher, 'function', 'constructor function exists');
	});

	test('should extend itself with object sent to constructor', function() {
		var matcher = new Matcher({
			a: 'a',
			b: 'b',
			c: 'c',
			isMatch: function() { return true; }
		});
		equal(matcher.a, 'a');
		equal(matcher.b, 'b');
		equal(matcher.c, 'c');
	});

	test('should throw exception if extension object has no isMatch function', function() {
		function test() {
			var matcher = new Matcher({
				a: 'a',
				b: 'b',
				c: 'c'
			});
		}
		throws(test);
	});
}());

(function() {
	var matcher;

	module('Matcher object', {
		setup: function() {
			matcher = new Matcher({
				isMatch: function(x) {
					return true;
				}
			});
		}
	});

	test('should start off with no child matchers', function() {
		equal(matcher._children.length, 0);
	});

	test('should have an inherited add method', function() {
		equal(typeof matcher.add, 'function');
	});

	test('should be able to add a child matcher object', function() {
		var child = new Matcher({
			isMatch: function() { return true; }
		});
		matcher.add(child);
		equal(matcher._children.length, 1);
	});

	test('should be able to add multiple child matcher objects', function() {
		var child1 = new Matcher({
			isMatch: function() { return true; }
		});
		var child2 = new Matcher({
			isMatch: function() { return true; }
		});
		matcher.add(child1);
		matcher.add(child2);
		equal(matcher._children.length, 2);
	});

	test('should throw an exception if we try to add a non-matcher child', function() {
		function test() {
			matcher.add({
				a: 'a',
				b: 'b',
				c: 'c'
			});
		}
		throws(test);
	});
}());

(function() {
	var matcher;

	module('Matcher with no children', {
		setup: function() {
			matcher = new Matcher({
				isMatch: function(x) {
					return x % 2 == 0; // match even numbers
				}
			});
		}
	});

	test('should return true if item is a match', function() {
		equal(matcher.match(0), true);
		equal(matcher.match(2), true);
		equal(matcher.match(4), true);
	});

	test('should return false if item is not a match', function() {
		equal(matcher.match(1), false);
		equal(matcher.match(3), false);
		equal(matcher.match(5), false);
	});

	test('should call onMatch method if item is a match', function(done) {
		expect(2);
		matcher.onMatch = function(x, match) {
			equal(x, 2, 'onMatch is called with item to match');
			equal(match, matcher, 'onMatch is called with matcher object that matched it');
			console.log(this);
		}
		matcher.match(2);
	});

	test('should not call onMatch method if item is not a match', function() {
		expect(0);
		matcher.onMatch = function(x) {
			ok(false);
		}
		matcher.match(3);
	});
}());

(function() {
	var matcher, child;

	module('Matcher with one child', {
		setup: function() {
			matcher = new Matcher({
				isMatch: function(x) {
					return x % 2 == 0; // match even numbers
				}
			});
			child = new Matcher({
				isMatch: function(x) {
					return x > 10; // match numbers greater than 10
				}
			});
			matcher.add(child);
		}
	});

	test('should return false if item does not match matcher or its child', function() {
		// number is not even and not greater than 10
		equal(matcher.match(1), false);
		equal(matcher.match(3), false);
		equal(matcher.match(9), false);
	});

	test('should return true if item matches matcher but not child', function() {
		// number is even but not greater than 10
		equal(matcher.match(0), true);
		equal(matcher.match(2), true);
		equal(matcher.match(4), true);
	});

	test('should return false if item matches child but not matcher', function() {
		// number is even but not greater than 10
		equal(matcher.match(11), false);
		equal(matcher.match(13), false);
		equal(matcher.match(1001), false);
	});

	test('should return true if item matches matcher and child', function() {
		// number is even and  greater than 10
		equal(matcher.match(12), true);
		equal(matcher.match(14), true);
		equal(matcher.match(1000), true);
	});

	test('should not trigger onMatch if item does not match matcher or its child', function() {
		expect(0);
		matcher.onMatch = function(x) {
			ok(false);
		};
		child.onMatch = function(x) {
			ok(false);
		}
		matcher.match(1);
		matcher.match(3);
		matcher.match(9);
	});

	test('should trigger matcher.onMatch true if item matches matcher but not child', function() {
		matcher.onMatch = function(x) {
			ok(true);
		};
		child.onMatch = function(x) {
			ok(false);
		}
		matcher.match(0);
		matcher.match(2);
		matcher.match(4);
	});

	test('should trigger child.onMatch if item matches matcher and child', function() {
		matcher.onMatch = function(x) {
			ok(false);
		};
		child.onMatch = function(x) {
			ok(true);
		}
		matcher.match(12);
		matcher.match(14);
		matcher.match(1000);
	});
}());

(function() {
	var matcher, child1, child2;

	module('Matcher with two children', {
		setup: function() {
			matcher = new Matcher({
				isMatch: function(x) {
					return x % 2 == 0; // match even numbers
				}
			});
			child1 = new Matcher({
				isMatch: function(x) {
					return x > 10; // match numbers greater than 10
				}
			});
			child2 = new Matcher({
				isMatch: function(x) {
					return x % 3 == 0; // match multiples of three
				}
			});
			matcher.add(child1);
			matcher.add(child2);
		}
	});

	test('should return false if item does not match matcher', function() {
		equal(matcher.match(1), false);
		equal(matcher.match(15), false);
	});

	test('should trigger matcher.onMatch if item matches matcher but not children', function() {
		matcher.onMatch = child1.onMatch = child2.onMatch = function(x, match) {
			equal(match, matcher);
		}
		matcher.match(2);
		matcher.match(4);
	});

	test('should trigger child2.onMatch if item matches matcher and child2, but not child1', function() {
		matcher.onMatch = child1.onMatch = child2.onMatch = function(x, match) {
			equal(match, child2);
		}
		matcher.match(0);
		matcher.match(6);
	});

	test('should trigger child1.onMatch if item matches matcher and child1', function() {
		matcher.onMatch = child1.onMatch = child2.onMatch = function(x, match) {
			equal(match, child1);
		}
		matcher.match(14);
		matcher.match(12);
	});
}());

(function() {
	var matcher, containsLetterA, containsLetterB, containsLetterC, containsLetterD, containsLetterE;

	module('Matcher returns matcher chain in onMatch method', {
		setup: function() {
			function containsLetterMatcher(letter) {
				return new Matcher({
					description: 'contains letter ' + letter,
					isMatch: function(x) {
						return x.indexOf(letter) != -1;
					}
				});
			}

			matcher = new Matcher({
				description: 'is a string',
				isMatch: function(x) {
					return typeof x == 'string';
				}
			});

			containsLetterA = containsLetterMatcher('a');
			containsLetterB = containsLetterMatcher('b');
			containsLetterC = containsLetterMatcher('c');
			containsLetterD = containsLetterMatcher('d');
			containsLetterE = containsLetterMatcher('e');

			matcher.add(containsLetterA);
			containsLetterA.add(containsLetterB);
			containsLetterB.add(containsLetterC);
			containsLetterC.add(containsLetterD);
			containsLetterD.add(containsLetterE);
		}
	});

	test('should pass a chain of successful matchers to onMatch function', function() {
		expect(3);
		containsLetterE.onMatch = function(x, match, chain) {
			deepEqual(chain, [matcher, containsLetterA, containsLetterB, containsLetterC, containsLetterD, containsLetterE]);
		}
		matcher.match('abcde');
		matcher.match('edcba');
		matcher.match('one bad cat');
	});
}());
