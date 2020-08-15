const Jimp = require('jimp');
const inquirer = require('inquirer');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  };

  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  await image.quality(100).writeAsync(outputFile);
};

const addImageWaterMarkToImage = async function(inputFile, outputFile, watermarkFile) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile); 
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;


  image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
  });

  await image.quality(100).writeAsync(outputFile);

};

const prepareOutputFilename = filename => {
    const [name, ext] = filename.split('.');
    const outputFilename = `${name}-with-watermark.${ext}`;

    return outputFilename;
};

const startApp = async () => {
    
    //Ask if user is ready
    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Welcome to "Watermark manager". Copy your images to `/img` folder. After that you will be able to use them in the app. Are you ready?',
        type: 'confirm',
    }]);

    //if answer is no, quit the app
    if(!answer.start) process.exit();

    //ask about input file and watermark type
    const options = await inquirer.prompt([{
        name: 'inputImage',
        type: 'input',
        message: 'What file do you want to mark?',
        default: 'test.jpg',
    }, {
        name: 'watermarkType',
        type: 'list',
        choices: ['Text watermark', 'Image watermark'],
    }]);

    //ask about path to watermark image or text to watermark text

    if (options.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
            name: 'value',
            type: 'input',
            message: 'Type your watermark text:',
        }]);

        options.watermarkText = text.value;
        addTextWatermarkToImage('./img/' + options.inputImage, prepareOutputFilename(options.inputImage), options.watermarkText);
    }
    else {
        const image = await inquirer.prompt([{
            name: 'filename',
            type: 'input',
            message: 'Type your watermark filename:',
            default: 'logo.png',
        }]);

        options.watermarkImage = image.filename;
        addImageWaterMarkToImage('./img/' + options.inputImage, prepareOutputFilename(options.inputImage), options.watermarkImage);
    }
}

startApp();

