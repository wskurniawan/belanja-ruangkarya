const express = require('express');
const axios = require('axios').default;
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');

const app = express();

var auth = {
   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoie1wiaWRcIjpcIjViZmM4NzI4ZTRhNDlhN2FhYWEwYzhlNFwiLFwiZW1haWxcIjpcIm1hdWxpZEBpaHNhbi5jb21cIixcIm5hbWFcIjpcIm1hdWxpZCBJaHNhblwiLFwiYWxhbWF0XCI6XCJKTC5MZW1wb25nIFNhcmlcIixcInRlbGVwb25cIjpcIjA4MTM0NTY3OFwifSJ9.4u2rABRGrku-N9B4-3YNVEsY6x0ezUXCYqGb0EepjYs"
}

app.use(cookie_parser());
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));
app.use('/public', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/signup', function(req, res, next){
	res.render('signup', { error: req.query.error });
});

app.post('/signup', function(req, res, next){
	var signup_data = req.body;

	axios.post('http://temuin.site:5000/v1/users/', signup_data).then(result => {
		res.redirect('/login');
	}).catch(error => {
		next(error);
	})
});

app.get('/login', function(req, res, next){
	if(req.cookies.token){
		//return res.redirect('/');
	}

	res.render('login', { error: req.query.error });
});

app.post('/login', function(req, res, next){
	var req_data = {
		email: req.body.email,
		password: req.body.password
	};

	axios.post('http://temuin.site:5000/v1/users/auth', req_data).then(result => {
		var token = result.data.token;

		res.cookie('token', token, { maxAge: 3600000 });
		res.redirect('/');
	}).catch(error => {
		next(error);
	});
});

app.use(function(req, res, next){
	if(!req.cookies.token){
		return res.redirect('/login');
	}

	req.token = 'Bearer ' + req.cookies.token;

	next();
});

app.get('/', function(req, res, next){
   axios.get('http://temuin.site:5000/v1/catalogs?q=Asus' , { headers: {
      Authorization: req.token
   }}).then(result => {
      var data = result.data;
      
      res.render('index', { list_item: data.products });
   }).catch(error => {
      next(error);
   });
});

app.get('/search', function(req, res, next){
   var keyword = req.query.keyword;

   axios.get('http://temuin.site:5000/v1/catalogs?q=' + keyword, { headers: {
      Authorization: req.token
   }}).then(result => {
      var data = result.data;
      
      res.render('index', { list_item: data.products });
   }).catch(error => {
      next(error);
   });
});

app.get('/kategori/:nama_kategori', function(req, res, next){
   var kategori = req.params.nama_kategori;

   //http://temuin.site:5000/v1/catalogs/komputer 
   axios.get('http://temuin.site:5000/v1/catalogs/' + kategori, { headers: {
      Authorization: req.token
   }}).then(result => {
      var data = result.data;
      
      res.render('index', { list_item: data.products });
   }).catch(error => {
      next(error);
   });  
});

app.get('/order/:id_vendor/:id_produk', function(req, res, next){
   //http://temuin.site:5000/v1/orders/add
   /*
      	"produk": {
            "vendor": 0,
            "id": "5bd542f55f92641cd5a2c9f8"
         },
         "pcs": 1 
   */
   var order_data = {
		produk: {
			vendor: parseInt(req.params.id_vendor),
			id: req.params.id_produk
		},
		pcs: 1
	};

	axios.post('http://temuin.site:5000/v1/orders/add', order_data, { headers: {
		Authorization: req.token
   }}).then(result => {
		res.redirect('/order/list');
	}).catch(error => {
		next(error);
	});
});

app.get('/order/list', function(req, res, next){
	axios.get('http://temuin.site:5000/v1/orders/', { headers: {
		Authorization: req.token
   }}).then(result => {
		res.render('list-order', {list_item: result.data.orders });
	}).catch(error => {
		next(error);
	})
});

app.get('/logout', function(req, res, next){
	res.clearCookie('token');
	res.redirect('/login');
});

app.use(function(err, req, res, next){
   res.send(err.message);
});

app.listen(5011, function(req, res, next){
   console.log('app ready di port 5011');
})