var mongoose = require('mongoose');
var Player = require("../models/player.js");
var Character = require("../models/character.js");

module.exports = {
	name: 'char-new',
	description: 'Creates a new character.',
	oneline: true,
	aliases: ['newchar'],
	usage: '[name]',
	args: true,
	cooldown: 3,
	execute(message, args) {
		// Is there already a character with that name?
		Character.find({
			name: args[0]
		}).exec(function (err, character) {
			if (err) {
				console.log("char-new - character.find: " + err);
				return message.author.send(err.message);
			}
			if (character.length > 0) {
				return message.author.send("A character with that name already exists.");
			}

			// If not, create new Character document
			Player.getPlayer(message, function (player) {
				if (!player) return;

				var newCharacter = new Character({
					_id: new mongoose.Types.ObjectId(),
					player: player._id,
					name: args[0],
					fullname: args[0]
				});
				newCharacter.save(function (err) {
					if (err) {
						console.log("char-new - newCharacter.save: " + err);
						return message.author.send(err.message);
					}

					message.author.send("Created new character " + args[0]);

					if (!player.selectedCharacter) {
						player.selectedCharacter = newCharacter._id;
						player.save(function (err) {
							if (err) {
								console.log("char-new - player.save: " + err);
								return message.author.send(err.message);
							}

							message.author.send("Selected " + newCharacter.name + " for other bot commands.");
						});
					} else {
						message.author.send(
							"If you want to select " + newCharacter.name + " for bot commands, use\n" +
							"> " + process.env.PREFIX + "char-select " + newCharacter.name
						);
					}
				});
			});
		});
	}
}