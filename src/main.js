var roleArcher = require('role.archer');
var roleBuilder = require('role.builder');
var roleClaimer = require('role.claimer');
var roleHarvester = require('role.harvester');
var roleHealer = require('role.healer');
var roleSoldier = require('role.soldier');
var roleUpgrader = require('role.upgrader');
var parameters = require('parameters');
var util = require('util');
var roomUtil = require('roomUtil');

module.exports.loop = function() {

  util.cleanupCreeps();
  var roles = [roleArcher, roleBuilder, roleClaimer, roleHarvester, roleHealer, roleSoldier, roleUpgrader];
  var numCreeps = _.size(Game.creeps);


  // spawn at least one harvester
  util.spawnBasicCreeps(roleHarvester, 2);
  util.spawnBasicCreeps(roleUpgrader, 1);
  util.spawnBasicCreeps(roleBuilder, 1);

  // TODO SOMETHING GOES HERE, NOT JUST COMMENTS
  var inputs = [[numCreeps]];
  for (var index in roles) {
    var role = roles[index];
    inputs.push([_.filter(Game.creeps, (creep) => creep.memory.role == role.name()).length]);
  }

  var desiredRoleProportion = parameters.forwardPropagation(inputs);

  info = "Actual :";
  for (var index in roles) {
      info += (roles[index].name() + "=" + inputs[parseInt(index) + 1] + ",");
  }
  info += ("total=" + inputs[0]);

  console.log(info);

  info = "Desired:";
  for (var index in roles) {
      info += (roles[index].name() + "=" + Math.ceil((numCreeps + 1) * desiredRoleProportion[index]));
      if (index < roles.length - 1) {
          info += ",";
      }
  }

  console.log(info);

  for (var index in roles) {
    var role = roles[index];
    var desiredNumWithRole = (numCreeps + 1) * desiredRoleProportion[index];
    var actualNumWithRole = inputs[parseInt(index) + 1];
    if (actualNumWithRole < desiredNumWithRole) {
      var newName = role.name() + Game.time;
      console.log('Spawning new creep: ' + newName);
      Game.spawns['Spawn1'].spawnCreep(role.parts(), newName,
        { memory: { role: role.name() } });
    }
  }

  if (Game.spawns['Spawn1'].spawning) {
    var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns['Spawn1'].pos.x + 1,
      Game.spawns['Spawn1'].pos.y,
      { align: 'left', opacity: 0.8 });
  }

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    switch (creep.memory.role) {
      case 'upgrader':
        roleUpgrader.run(creep);
        break;
      case 'builder':
        roleBuilder.run(creep);
        break;
      case 'claimer':
        roleClaimer.run(creep);
        break;
      case 'healer':
        roleHealer.run(creep);
        break;
      case 'soldier':
        roleSoldier.run(creep);
        break;
      case 'archer':
        roleArcher.run(creep);
        break;
      case 'harvester':
      default:
        roleHarvester.run(creep);
        break;
    }
  }

  // Create construction site
  roomUtil.construct(Game.spawns['Spawn1'].room, Game.spawns.Spawn1.pos.x - 2, Game.spawns.Spawn1.pos.y, STRUCTURE_EXTENSION);
  roomUtil.construct(Game.spawns['Spawn1'].room, Game.spawns.Spawn1.pos.x + 2, Game.spawns.Spawn1.pos.y, STRUCTURE_EXTENSION);
  roomUtil.construct(Game.spawns['Spawn1'].room, Game.spawns.Spawn1.pos.x, Game.spawns.Spawn1.pos.y - 2, STRUCTURE_EXTENSION);
  roomUtil.construct(Game.spawns['Spawn1'].room, Game.spawns.Spawn1.pos.x, Game.spawns.Spawn1.pos.y + 2, STRUCTURE_EXTENSION);
  roomUtil.construct(Game.spawns['Spawn1'].room, Game.spawns.Spawn1.pos.x - 2, Game.spawns.Spawn1.pos - 2, STRUCTURE_EXTENSION);
}
