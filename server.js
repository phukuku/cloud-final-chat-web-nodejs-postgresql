let express = require('express');
let session = require('express-session');
let expressFileupload = require('express-fileupload');
let sharp = require('sharp');
let app = express();
const socketIo = require('socket.io');

let server = require('http').createServer(app);
const io = socketIo(server);
let flash = require('connect-flash');
//const mysql = require('mysql');
const path = require('path');
const jquery = require('jquery');
const fs = require('fs');
const htmlspecialchars = require('htmlspecialchars');
const htmlspecialchars_decode = require('htmlspecialchars_decode');

// prepare server
// app.use('/api', api); // redirect API calls
// app.use('/custom', express.static(__dirname + '/node_modules/custom/')); // redirect root
app.use('/jsjq', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/font', express.static(__dirname + '/font')); // redirect root
app.use('/img', express.static(__dirname + '/img')); // redirect to img

app.use(flash());
app.use(express.static('public'));
app.use(express.urlencoded({
  extended: false
}));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(expressFileupload());

const Pool = require("pg").Pool;
const connection = new Pool({
  user: "default",
  host: "ep-bitter-frost-07401869-pooler.ap-southeast-1.postgres.vercel-storage.com",
  database: "verceldb",
  password: "HZWo1Lcg3RTa",
  port: 5432,
  ssl: {
    rejectUnauthorized: false, 
  },
});

  module.exports = connection;


yangterhubung = []

app.set('views', './views');
app.set('view engine', 'ejs');

try {
  server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
  });
} catch (error) {
  console.error('Error starting the server:', error);
}


function now__() {
  function pad(val) {
    var str = "" + val;
    var pad = "00";
    var ans = pad.substring(0, pad.length - str.length) + str;
    return ans;
  }

  let dt = new Date();
  let time = pad(dt.getHours()) + ":" + pad(dt.getMinutes()) + " " + dt.getDate() + "/" + pad(dt.getMonth()+1) + "/" + dt.getFullYear();
  return time
}

app.get('/', function(req, res) {
	let flash_data = req.flash('login');
	let flash_ = '';
	if (flash_data != '') {
		flash_ = flash_data[0];
	}else {
		flash_ = 'Succ';
	}
	console.log(flash_);
	res.render('login', {flash_login: flash_data, type: flash_.substr(0, 4) == 'Succ' ? 'signup' : 'signin'});
})


app.get('/index/:id_receiver', async (req, res) => {
  try {
    if (req.session.loggedin) {
      // Fetch the chat group information
      const chatGroupInfoQuery = `SELECT cf.id_group_chat FROM cn_user cu
         JOIN cn_friend cf ON cf.id_user = cu.id_user OR cf.id_friend = cu.id_user
         WHERE cu.id_user = $1
         AND (cf.id_user = $2 OR cf.id_friend = $2);`;
      const chatGroupInfoResults = await connection.query(chatGroupInfoQuery, [
        req.session.id_user,
        req.params.id_receiver,
      ]);

      // Fetch the user information
      const userInfoQuery = `SELECT name, id_user FROM cn_user WHERE id_user = $1;`;
      const userInfoResults = await connection.query(userInfoQuery, [req.params.id_receiver]);

      if (!chatGroupInfoResults.rows[0]) {
        // Redirect if the chat group information is not available
        res.redirect('/list');
        return;
      }

      // Fetch chat history and user profile information
      const chatHistoryQuery = `SELECT id_chat, user_id, message, time_chat, img
        FROM cn_chat
        WHERE id_group_chat = $1 AND who = $2
        ORDER BY id_chat ASC;`;
      const userProfileQuery = `SELECT img_profile, information FROM cn_user WHERE id_user = $1;`;
      const [chatHistoryResults, userProfileResults] = await Promise.all([
        connection.query(chatHistoryQuery, [chatGroupInfoResults.rows[0].id_group_chat, req.session.username]),
        connection.query(userProfileQuery, [req.params.id_receiver]),
      ]);

      // Decode HTML entities in messages
      chatHistoryResults.rows.forEach((item, i) => {
        chatHistoryResults.rows[i]['message'] = htmlspecialchars_decode(item.message);
      });

      // Render the view
      res.render('index', {
        user_login: req.session,
        data_receiver: userInfoResults.rows[0],
        group: chatGroupInfoResults.rows[0],
        history_chat: chatHistoryResults.rows,
        img_profile: userProfileResults.rows[0].img_profile,
        information: htmlspecialchars_decode(userProfileResults.rows[0].information),
      });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle the error and render an error page or redirect as needed
    res.status(500).send('Internal Server Error');
  }
});

app.get('/list', (req, res) => {
  if (req.session.loggedin) {
    connection.query(
      `SELECT cu.*
      FROM cn_friend cf
      JOIN cn_user cu ON cf.id_friend = cu.id_user
      WHERE cf.id_user = ${req.session.id_user}
      AND cf.who = '${req.session.username}';
      
      SELECT cc.*, cu.name, cu.id_user AS id_friend, cu.username, cu.img_profile
      FROM cn_chat cc
      JOIN cn_user cu ON cu.username = SPLIT_PART(cc.id_group_chat, '_', (CASE WHEN SPLIT_PART(cc.id_group_chat, '_', -1) = '${req.session.username}' THEN 1 ELSE -1 END))
      WHERE id_chat IN (
        SELECT MAX(id_chat)
        FROM cn_chat
        WHERE id_group_chat LIKE '%${req.session.username}%'
        AND who = '${req.session.username}'
        GROUP BY id_group_chat
      );

      SELECT img_profile FROM cn_user WHERE id_user = ${req.session.id_user}`,
      (error, results) => {
        if (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
          return;
        }

        // Assuming 'rows' property for each result set
        results[1].rows.forEach((item, i) => {
          results[1].rows[i]['message'] = htmlspecialchars_decode(item.message);
        });

        res.render('list', {
          items: results[0].rows,
          chat_list: results[1].rows,
          user_login: req.session,
          flash: req.flash('login'),
          img_profile: results[2].rows[0].img_profile,
        });
      }
    );
  } else {
    res.redirect('/');
  }
});




//ok roi
app.post('/check_username', async (req, res) => {
  try {
    const username = req.body.username;
    const query = {
      text: 'SELECT username FROM cn_user WHERE username = $1',
      values: [username],
    };
    const { rows } = await connection.query(query);

    if (rows.length > 0) {
      res.json(1); // Username exists
    } else {
      res.json(0); // Username does not exist
    }
  } catch (error) {
  
  }
});

app.post('/signup', async (req, res) => {
  try {
    const username = req.body.username;
    const name = req.body.name;
    const password = req.body.password;
    const imgProfileValue = '/img/default.png';

    // Check if the username already exists
    const checkQuery = {
      text: 'SELECT username FROM cn_user WHERE username = $1',
      values: [username],
    };
    const { rows } = await connection.query(checkQuery);

    if (rows.length > 0) {
      // Username already exists, handle accordingly (e.g., send an error response)
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    // If the username does not exist, insert the new user
    const insertQuery = {
      text: 'INSERT INTO cn_user (username, name, password, img_profile) VALUES ($1, $2, $3, $4)',
      values: [username, name, password,imgProfileValue],
    };
    await connection.query(insertQuery);

    req.flash('login', 'Successfully added account, please login...');
    res.redirect('/');
  } catch (error) {
    console.error('Error executing the query:', error);
    req.flash('login', 'Error adding account');
    res.redirect('/');
  }
});
// ok phía tren
app.post('/signin', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    // Query the database to check if the username and password match
    const query = {
      text: 'SELECT * FROM cn_user WHERE username = $1 AND password = $2',
      values: [username, password],
    };
    const { rows } = await connection.query(query);

    if (rows && rows.length > 0) {
      // User with the provided username and password exists
      req.session.loggedin = true;
      req.session.username = rows[0].username;
      req.session.name = rows[0].name;
      req.session.id_user = rows[0].id_user;
      req.session.information = htmlspecialchars_decode(rows[0].information);
      req.session.img_profile = rows[0].img_profile;

      req.flash('login', 1);
      res.redirect('/list');
    } else {
      // No user found with the provided username and password
      req.flash('login', 'Wrong Password or Username!');
      res.redirect('/');
    }
  } catch (error) {
    // Handle the database query error
    console.error('Error executing the query:', error);
    req.flash('login', 'Error during login');
    res.redirect('/');
  }
});



app.post('/find', async (req, res) => {
  try {
    const searchTerm = `%${req.body.username}%`;
    const userId = req.session.id_user;
    const query = 'SELECT * FROM cn_user WHERE username ILIKE $1 AND id_user != $2';
    const values = [searchTerm, userId];
    // console.log('Query:', query, values);
    const results = await connection.query(query, values);

    let hasil;
    if (results.rows.length > 0) {
      hasil = results.rows;
    } else {
      hasil = 0;
    }
    return res.render('result', {
      user_login: req.session,
      items: hasil,
    });
  } catch (error) {
    console.error('Error executing the query:', error);
    return res.render('error', { user_login: req.session });
  }
});

app.post('/cek_friend', (req, res) => {

  connection.query(
    `SELECT * FROM cn_friend 
    WHERE (id_friend = ${req.body.id_friend} AND id_user = ${req.session.id_user} AND who = '${req.session.username}')
    OR (id_user = ${req.body.id_friend} AND id_friend = ${req.session.id_user} AND who = '${req.session.username}')`,
    (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      let hasil;
      if (results.rows.length > 0) {
        hasil = 0; // Đã là bạn bè
      } else {
        hasil = 1; // Chưa là bạn bè
      }
      res.json(hasil);
    }
  );
});





app.post('/add_friend', async (req, res) => {
  try {
    if (req.session.loggedin) {
      const gt = req.body.id_group_chat.split('_');

      // Start a transaction
      await connection.query('BEGIN');

      const insertQuery = {
        text: `INSERT INTO cn_friend (id_user, id_friend, id_group_chat, who) 
               VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)
               RETURNING id_friend`,
        values: [
          req.session.id_user, req.body.id_friend, req.body.id_group_chat, gt[0],
          req.session.id_user, req.body.id_friend, req.body.id_group_chat, gt[1]
        ],
      };

      const results = await connection.query(insertQuery);

      const insertedFriendId = results.rows[0].id_friend;

      const imgProfileQuery = {
        text: 'SELECT img_profile FROM cn_user WHERE id_user = $1 OR id_user = $2',
        values: [req.session.id_user, req.body.id_friend],
      };

      const imgProfileResults = await connection.query(imgProfileQuery);

      // Commit the transaction
      await connection.query('COMMIT');

      const imgProfile = imgProfileResults.rows[0].img_profile;

      res.json({ success: 1, img_profile_friend: imgProfile, insertedFriendId });
    }
  } catch (error) {
    // Rollback the transaction in case of an error
    await connection.query('ROLLBACK');

    res.status(500).json({ error: 'Internal Server Error' });
  }
});





app.post('/uploadpp', function(req, res) {
  let thefile = req.files.img;
  if (req.session.loggedin) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded. Back');
    }else if (thefile.mimetype.split('/')[0] != 'image') {
      return res.status(400).send('file must be image. Back');
    }
    let name_file = +new Date() + thefile.md5;
    let path = __dirname + '/img/ak47/' + name_file + '.' + thefile.name.split('.')[1];
    let for_save = '/img/ak47/' + name_file + '.' + thefile.name.split('.')[1];

    sharp(thefile.data)
    .resize(400, 400)
    .toFile(path, (err, info) => {
      if (err == null) {
        connection.query(
          `SELECT img_profile FROM cn_user WHERE id_user = ${req.session.id_user}`,
          (error, img_data) => {
            if (img_data.length > 0) {
              fs.unlink(__dirname+img_data[0].img_profile, (err) => {
                if (err) {
                  console.error(err)
                }
              })
            }
            //UPDATE
            connection.query(
              `UPDATE cn_user SET img_profile = $1 WHERE id_user = $2`,
              [for_save, req.session.id_user],
              (error, results) => {
                if (error) {
                  return res.status(400).send('Service Unracable, try again later. Back');
                }else {
                  req.session.img_profile = for_save
                  res.redirect('/list');
                }
              }
            )

          }
        )
      }else {
        return res.status(500).send(err);
      }
    });

  }else {
    res.redirect('/')
  }
});



app.post('/sendimg', async function(req, res) {
  try {
    if (!req.session.loggedin) {
      return res.redirect('/');
    }

    const thefile = req.files.img;

    if (!thefile || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded. Back');
    } else if (thefile.mimetype.split('/')[0] !== 'image') {
      return res.status(400).send('File must be an image. Back');
    }

    const explode = req.body.group_chat.split('_');
    const time = now__();
    const name_file = +new Date() + thefile.md5;
    const path = __dirname + '/img/ss2v5/' + name_file + '.' + thefile.name.split('.')[1];
    const for_save = '/img/ss2v5/' + name_file + '.' + thefile.name.split('.')[1];

    // Resize and save the image using sharp
    await sharp(thefile.data)
      .resize(400, 400)
      .toFile(path);

    // Insert chat records into the database using parameterized query
    const insertQuery = `INSERT INTO cn_chat (message, id_group_chat, user_id, time_chat, who, img)
  VALUES($1, $2, $3, $4, $5, $6),($1, $2, $3, $4, $7, $8)
    `;

    const insertValues = [
      `${req.session.name} send an image!`,
      req.body.group_chat,
      req.body.id_user,
      time,
      explode[0],
      for_save,
      explode[1],
      for_save,
    ];

    const { rowCount } = await connection.query(insertQuery, insertValues);

    if (rowCount > 0) {
      // Emit socket events
      io.sockets.emit(`new_message_${req.body.group_chat}`, {
        msg: `${req.session.name} send an image !`,
        sender: req.body.username,
        time: time,
        img: for_save,
      });

      io.sockets.emit(`notification_${req.body.receiver}`, {
        msg: htmlspecialchars_decode(req.body.message),
        sender: req.body.username,
        receiver: req.body.receiver,
        time: time,
        id_receiver: req.body.id_user,
        name: req.body.name,
        img_profile: req.body.img_profile,
      });

      res.redirect('/index/' + req.body.id_receiver);
    } else {
      return res.status(400).send('Service Unreachable, try again later. Back');
    }
  } catch (error) {
    console.error('Error during image upload:', error);
    res.status(500).send('Internal Server Error. Back');
  }
});


app.post('/delete_chat', async (req, res) => {
  if (req.session.loggedin) {
    try {
      const result_1 = await connection.query(
        `SELECT cf.id_group_chat FROM cn_user cu
         JOIN cn_friend cf ON cf.id_user = cu.id_user OR cf.id_friend = cu.id_user
         WHERE cu.id_user = $1
         AND (cf.id_user = $2 OR cf.id_friend = $3)`,
        [req.session.id_user, req.body.id_friend, req.body.id_friend]
      );

      const idGroupChat = result_1.rows[0].id_group_chat;

      const results_2 = await Promise.all([
        connection.query(`SELECT DISTINCT who FROM cn_chat WHERE id_group_chat = $1`, [idGroupChat]),
        connection.query(`SELECT DISTINCT img FROM cn_chat WHERE id_group_chat = $1 AND img != ''`, [idGroupChat])
      ]);

      if (results_2[0].rows.length === 1 && results_2[1].rows.length !== 0) {
        for (const val of results_2[1].rows) {
          try {
            await fs.promises.unlink(__dirname + val.img);
          } catch (err) {
            console.error(err);
          }
        }
      }

      const results_3 = await connection.query(
        `DELETE FROM cn_chat WHERE id_group_chat = $1 AND who = $2`,
        [idGroupChat, req.session.username]
      );

      if (results_3.rowCount > 0) {
        res.json(1);
      } else {
        res.json(0);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.redirect('/');
  }
});


app.post('/delete_contact', async (req, res) => {
  try {
    if (req.session.loggedin) {
      const result_1 = await connection.query(
        `SELECT cf.id_group_chat FROM cn_user cu
         JOIN cn_friend cf ON cf.id_user = cu.id_user OR cf.id_friend = cu.id_user
         WHERE cu.id_user = $1
         AND (cf.id_user = $2 OR cf.id_friend = $3)`,
        [req.session.id_user, req.body.id_friend, req.body.id_friend]
      );

      const idGroupChat = result_1.rows[0].id_group_chat;

      const results_2 = await Promise.all([
        connection.query(`DELETE FROM cn_chat WHERE id_group_chat = $1 AND who = $2`, [idGroupChat, req.session.username]),
        connection.query(`DELETE FROM cn_friend WHERE id_group_chat = $1 AND (who = $2 OR who = $3)`, [idGroupChat, req.session.username, req.body.id_friend]),
      ]);

      if (results_2[1].rowCount > 0) {
        res.json(1);
      } else {
        res.json(0);
      }
      
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Helper function to promisify connection.query
function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}


app.post('/update_stat_info', function(req, res) {
  if (req.session.loggedin) {
    const kind = req.body.kind__;
    const value = htmlspecialchars(req.body.val__);

    connection.query(
      'UPDATE cn_user SET ' + kind + ' = $1 WHERE id_user = $2',
      [value, req.session.id_user],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(400).send('Service Unreachable, try again later. Back');
        } else {
          if (results.rowCount > 0) { // PostgreSQL uses rowCount for the number of affected rows
            if (kind === 'name') {
              req.session.name = value;
            } else {
              req.session.information = value;
            }
            return res.redirect('/list');
          }
        }
      }
    );
  } else {
    res.redirect('/');
  }
});




// Helper function to promisify connection.query
function queryAsync(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}





app.get('/logout', function(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/');
  });
});

io.sockets.on('connection', function(socket) {
  yangterhubung.push(socket);
  console.log('banyak socket yang terhubung : %s', yangterhubung.length);

  //disconnect
  socket.on('disconnect', function(data) {
    yangterhubung.splice(yangterhubung.indexOf(socket), 1);
    console.log('Terputus: %s ', yangterhubung.length);
  });

  // send message
  socket.on('send_message', async function(data) {
    let explode = data.group.split('_');
    let time = now__();

    try {
      const insertQuery = `INSERT INTO cn_chat (message, id_group_chat, user_id, time_chat, who)
        VALUES ($1, $2, $3, $4, $5), ($1, $2, $3, $4, $6)`;
      
      const insertValues = [
        htmlspecialchars(data.message),
        data.group,
        data.id_me,
        time,
        explode[0],
        explode[1],
      ];

      const results = await connection.query(insertQuery, insertValues);

      if (results !== undefined) {
        if (results.rowCount) {
          io.sockets.emit(`new_message_${data.group}`, {
            msg: htmlspecialchars_decode(data.message),
            sender: data.username,
            time: time,
            img: '',
          });

          io.sockets.emit(`notification_${data.receiver}`, {
            msg: htmlspecialchars_decode(data.message),
            sender: data.username,
            receiver: data.receiver,
            time: time,
            id_receiver: data.id_me,
            name: data.name,
            img_profile: data.img_profile,
          });
        } else {
          io.sockets.emit(`new_message_${data.group}`, {
            msg: '~',
            sender: '~',
          });
        }
      } else {
        io.sockets.emit(`new_message_${data.group}`, {
          msg: '~*',
          sender: '~*',
        });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      io.sockets.emit(`new_message_${data.group}`, {
        msg: '~*',
        sender: '~*',
      });
    }
  });
});