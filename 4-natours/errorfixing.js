exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        res.status(400).json({
                status: "failed",
                message: err
            },
        )
    }

    // eslint-disable-next-line no-shadow
exports.createTour = async (req, res) => {
        try {
            const newTour = await Tour.create(req.body);
            res.status(201).json({
                status: "success",
                data: newTour
            })
        } catch (err) {
            res.status(400).json({
                status: "failed",
                message: err
            })
        }
       
    };

    exports.updateTour = (req, res) => {
        //   if (req.params.id * 1 > tours.length) {
        //     return res.status(404).json({
        //       status: 'fail',
        //       message: 'Invalid ID',
        //     });
        //   }
          res.status(200).json({
            status: 'success',
            data: {
              tour: '<updated datas here>...',
            },
          });
    };

    exports.deleteTour = (a, b) => {
            // console.log(a, b);
            
          if (req.params.id * 1 > tours.length) {
            return res.status(404).json({
              status: 'fail',
              message: 'Invalid ID'
            });
          }
          res.status(204).json({
            status: 'success',
            data: null,
          });
    }
    };