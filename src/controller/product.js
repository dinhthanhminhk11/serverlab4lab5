import Product from "../models/product";


class ProductClass {
    async addProduct(req, res) {
        try {
            const checkProduct = await Product.findOne({ name: req.body.name })
            if (checkProduct) {
                return res.status(200).json(
                    {
                        "success": 0,
                        "message": "product already exists"
                    }
                );
            }

            const dataCatogory = {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description
            }
            const resault = await new Product(dataCatogory).save()

            if (resault) {
                return res.status(200).json(
                    {
                        "success": 1,
                        "message": "Product successfully created."
                    }
                );
            }
        } catch (error) {
            console.log(err);
            res.status(500).send("Server error");
        }
    }

    async deleteProduct(req, res) {
        try {
            const data = await Product.findOneAndDelete({ _id: req.params.id })
            if (data) {
                return res.status(200).json(
                    {
                        "success": 1,
                        "message": "Product successfully deleted."
                    }
                );
            }
        } catch (error) {
            console.log(err);
            res.status(500).send("Server error");
        }
    }

    async updateProduct(req, res) {
        try {
            const dataUpdate = await Product.updateOne({ _id: req.params.id }, {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description
            })
            if (dataUpdate) {
                return res.status(200).json(
                    {
                        "success": 1,
                        "message": "Product successfully updated."
                    }
                );
            }
        } catch (error) {
            console.log(err);
            res.status(500).send("Server error");
        }
    }

    async getProductById(req, res) {
        try {
            const data = await Product.findById({ _id: req.params.id });
            return res.status(200).json(
                {
                    "product": data,
                    "success": 1
                }
            );
        } catch (error) {
            console.log(err);
            res.status(500).send("Server error");
        }
    }

    async getAllProduct(req, res) {
        try {
            const data = await Product.find()
            return res.status(200).json(
                {
                    "products": data,
                    "success": 1
                }
            );
        } catch (error) {
            console.log(err);
            res.status(500).send("Server error");
        }
    }

}


export default new ProductClass();