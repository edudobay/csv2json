import test from 'ava';
import { assigners } from '../bin/index';

const { attr, arrayIndex, pipe } = assigners;

test('object assigner', t => {
  const assigner = attr('color');
  const result = assigner.assign(null, 'red');
  t.deepEqual(result, {color: 'red'});
})

test('chained object assigners', t => {
  const assigner = attr('user');
  const subAssigner = attr('name')
  const result = assigner.assign(null, subAssigner.assign(null, 'Eric'));
  t.deepEqual(result, {user: {name: 'Eric'}});
})

test('object assigner\'s associated getter', t => {
  const assigner = attr('color');
  const result = assigner.get({color: 'red'});
  t.is(result, 'red');
})

test('array index assigner', t => {
  const assigner = arrayIndex(0);
  const result = assigner.assign(null, 'Robert');
  t.deepEqual(result, ['Robert']);
})

test('array index assigner over already existent array', t => {
  const assigner = arrayIndex(0);
  const result = assigner.assign(['Bellatrix', 'Fabien'], 'Lucy');
  t.deepEqual(result, ['Lucy', 'Fabien']);
})

test('pipe getter: object | object', t => {
  const assigner = pipe(attr('user'), attr('name'));
  const result = assigner.get({user: {name: 'Darcy'}});
  t.is('Darcy', result);
})

test('pipe getter: object | array | object', t => {
  const assigner = pipe(attr('users'), arrayIndex(0), attr('first'));
  const result = assigner.get({users: [{first: 'Barbara'}]});
  t.is(result, 'Barbara');
})

test('pipe: object assigner | array index assigner', t => {
  const assigner = pipe(attr('names'), arrayIndex(0));
  const result = assigner.assign(null, 'Robert');
  t.deepEqual(result, {names: ['Robert']});
})

test('pipe: object | array | object', t => {
  const assigner = pipe(attr('users'), arrayIndex(0), attr('first'));
  const result = assigner.assign(null, 'Barbara');
  t.deepEqual(result, {users: [{first: 'Barbara'}]});
})

test('two object assignments in a row', t => {
  const assigner1 = pipe(attr('user'), attr('name'));
  const assigner2 = pipe(attr('user'), attr('phone'));

  const result = assigner2.assign(assigner1.assign(null, 'Grace'), '5557508');
  t.deepEqual(result, {user: {name: 'Grace', phone: '5557508'}});
})

test('two overwriting array-object assignments in a row', t => {
  const assigner1 = pipe(attr('users'), arrayIndex(0));
  const assigner2 = pipe(attr('users'), arrayIndex(0));

  const result = assigner2.assign(assigner1.assign(null, 'Beth'), 'Oliver');
  t.deepEqual(result, {users: ['Oliver']});
})

test('two array-object assignments in a row', t => {
  const assigner1 = pipe(arrayIndex(0), attr('name'));
  const assigner2 = pipe(arrayIndex(0), attr('phone'));

  const result = assigner2.assign(assigner1.assign(null, 'Grace'), '5557508');
  t.deepEqual(result, [{name: 'Grace', phone: '5557508'}]);
})

test('two object-array-object assignments in a row', t => {
  const assigner1 = pipe(attr('users'), arrayIndex(0), attr('name'));
  const assigner2 = pipe(attr('users'), arrayIndex(0), attr('phone'));

  const result = assigner2.assign(assigner1.assign(null, 'Grace'), '5557508');
  t.deepEqual(result, {users: [{name: 'Grace', phone: '5557508'}]});
})
