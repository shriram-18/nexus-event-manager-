const mongoose = require('mongoose');
const Event = require('./models/Event');

async function test() {
    await mongoose.connect('mongodb+srv://patilshriram93_db_user:jXBuwAanCkBMkCxL@portfoliocluster.wv8itpa.mongodb.net/nexus-events?appName=PortfolioCluster');
    
    const count = await Event.countDocuments({ id: 'NEX-GS0UJH' });
    console.log("Found:", count);

    const event = await Event.findOne({ id: 'NEX-GS0UJH' });
    if(event) {
        console.log("event.id properties");
        console.log("event.id direct:", event.id);
        console.log("event toJSON .id:", event.toJSON().id);
        console.log("event _id:", event._id.toString());
    }
    process.exit(0);
}
test();
