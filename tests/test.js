import test from 'ava';
import { assigners } from '../src/index';

test('object assigner', t => {
  const [assigner, _] = assigners.attr('color');
  const result = assigner(null, 'red');
  t.deepEqual(result, {color: 'red'});
})

test('chained object assigners', t => {
  const [assigner, _] = assigners.attr('user');
  const [subAssigner, _2] = assigners.attr('name')
  const result = assigner(null, subAssigner(null, 'Eric'));
  t.deepEqual(result, {user: {name: 'Eric'}});
})

test('object assigner\'s associated getter', t => {
  const [_, getter] = assigners.attr('color');
  const result = getter({color: 'red'});
  t.is(result, 'red');
})

test('array index assigner', t => {
  const [assigner, _] = assigners.arrayIndex(0);
  const result = assigner(null, 'Robert');
  t.deepEqual(result, ['Robert']);
})

test('pipe: object assigner | array index assigner', t => {
  const assigner = assigners.pipe(
    assigners.attr('names'),
    assigners.arrayIndex(0),
  )

  const result = assigner(null, 'Robert');
  t.deepEqual(result, {names: ['Robert']});
})

test('pipe: object | array | object', t => {
  const assigner = assigners.pipe(
    assigners.attr('users'),
    assigners.arrayIndex(0),
    assigners.attr('first'),
  )

  const result = assigner(null, 'Barbara');
  t.deepEqual(result, {users: [{first: 'Barbara'}]});
})

// TODO: Not implemented yet
test.skip('two object assignments in a row', t => {
  const assigner1 = assigners.pipe(assigners.attr('user'))
})
