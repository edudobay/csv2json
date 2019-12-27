import test from 'ava';
import { assigners } from '../bin/index';

test('object assigner', t => {
  const assigner = assigners.attr('color');
  const result = assigner.assign(null, 'red');
  t.deepEqual(result, {color: 'red'});
})

test('chained object assigners', t => {
  const assigner = assigners.attr('user');
  const subAssigner = assigners.attr('name')
  const result = assigner.assign(null, subAssigner.assign(null, 'Eric'));
  t.deepEqual(result, {user: {name: 'Eric'}});
})

test('object assigner\'s associated getter', t => {
  const assigner = assigners.attr('color');
  const result = assigner.get({color: 'red'});
  t.is(result, 'red');
})

test('array index assigner', t => {
  const assigner = assigners.arrayIndex(0);
  const result = assigner.assign(null, 'Robert');
  t.deepEqual(result, ['Robert']);
})

test('pipe: object assigner | array index assigner', t => {
  const assigner = assigners.pipe(
    assigners.attr('names'),
    assigners.arrayIndex(0),
  )

  const result = assigner.assign(null, 'Robert');
  t.deepEqual(result, {names: ['Robert']});
})

test('pipe: object | array | object', t => {
  const assigner = assigners.pipe(
    assigners.attr('users'),
    assigners.arrayIndex(0),
    assigners.attr('first'),
  )

  const result = assigner.assign(null, 'Barbara');
  t.deepEqual(result, {users: [{first: 'Barbara'}]});
})

// TODO: Not implemented yet
test.skip('two object assignments in a row', t => {
  const assigner1 = assigners.pipe(assigners.attr('user'))
})
