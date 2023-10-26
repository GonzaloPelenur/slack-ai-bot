const randomElement = (array) => {
    let randomInt = Math.floor(Math.random() * array.length);
    return array[randomInt]
}

const momentImages = [
    "https://media.giphy.com/media/dYQ9x1sX1u1dIuLXG8/giphy-downsized.gif",
    "https://media.giphy.com/media/bUMJoLLaJ2oygrTFIp/giphy-downsized.gif",
    "https://media.giphy.com/media/WV2tRAlb4Qc741GHVn/giphy-downsized.gif"
];

module.exports = () => {
    return randomElement(momentImages);
}