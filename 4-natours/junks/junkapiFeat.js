    // console.log(req.query);
    // BUILD QUERY

    //IMPLEMENTING FILTER ALGORITHM (UNREFACTORED)
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);
   
    // ADVANCED FILTERING OPTIONAL
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(lte|gte|lt|gt)\b/g, (match) => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));
    // console.log(JSON.parse(queryStr));

    // SORTING
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt');
    // }
    // Limiting fields
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    // PAGINATION;
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const noOfTours = await Tour.countDocuments();
    //   if (skip >= noOfTours) throw new Error('This page does not exist!!');
    // }

    // tourroutes
    // exports.createTour = async (req, res) => {
//   const newTour = await Tour.create(req.body);
//   try {
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   }catch (err) {
//     res.status(404).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };