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

test('two object assignments in a row', t => {
  const assigner1 = assigners.pipe(assigners.attr('user'), assigners.attr('name'));
  const assigner2 = assigners.pipe(assigners.attr('user'), assigners.attr('phone'));

  const result = assigner2.assign(assigner1.assign(null, 'Grace'), '5557508');
  t.deepEqual(result, {user: {name: 'Grace', phone: '5557508'}});
})

test('two overwriting array-object assignments in a row', t => {
  const assigner1 = assigners.pipe(assigners.attr('users'), assigners.arrayIndex(0));
  const assigner2 = assigners.pipe(assigners.attr('users'), assigners.arrayIndex(0));

  const result = assigner2.assign(assigner1.assign(null, 'Beth'), 'Oliver');
  t.deepEqual(result, {users: ['Oliver']});
})

test('two array-object assignments in a row', t => {
  const assigner1 = assigners.pipe(assigners.arrayIndex(0), assigners.attr('name'));
  const assigner2 = assigners.pipe(assigners.arrayIndex(0), assigners.attr('phone'));

  const result = assigner2.assign(assigner1.assign(null, 'Grace'), '5557508');
  t.deepEqual(result, [{name: 'Grace', phone: '5557508'}]);
})

test('two object-array-object assignments in a row', t => {
  const assigner1 = assigners.pipe(assigners.attr('users'), assigners.arrayIndex(0), assigners.attr('name'));
  const assigner2 = assigners.pipe(assigners.attr('users'), assigners.arrayIndex(0), assigners.attr('phone'));

  const result = assigner2.assign(assigner1.assign(null, 'Grace'), '5557508');
  t.deepEqual(result, {users: [{name: 'Grace', phone: '5557508'}]});
})
