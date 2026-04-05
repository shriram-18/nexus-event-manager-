const mongoose = require('mongoose');
const Event = require('./models/Event');
mongoose.connect('mongodb+srv://patilshriram93_db_user:jXBuwAanCkBMkCxL@portfoliocluster.wv8itpa.mongodb.net/nexus-events?appName=PortfolioCluster')
.then(async () => {
    const events = await Event.find({});
    console.log("Total events:", events.length);
    events.forEach(e => console.log(`_id: ${e._id}, id: ${e.id}, title: ${e.title}`));
    process.exit(0);
});
