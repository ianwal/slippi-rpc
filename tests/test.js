const { SlippiGame, characters } = require("@slippi/slippi-js");
const rpc = require("../src/rpc.js");

test('adds 1 + 2 to equal 3', () => {
    expect(characters.getCharacterName(0)).toBe("Captain Falcon");
});

test('known stage', () => {
    expect(rpc.getStageName(31)).toBe("Battlefield");
});

test('unknown stage', () => {
    expect(rpc.getStageName(123)).toBe("Unknown Stage");
});
