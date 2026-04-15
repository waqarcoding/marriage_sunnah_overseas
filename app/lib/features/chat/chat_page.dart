import 'package:flutter/material.dart';

// Sample chat data
const List chats_json = [
  {
    "img": "https://randomuser.me/api/portraits/women/5.jpg",
    "name": "Lana",
    "online": true,
    "story": true,
  },
  {
    "img": "https://randomuser.me/api/portraits/men/6.jpg",
    "name": "Jake",
    "online": false,
    "story": false,
  },
  {
    "img": "https://randomuser.me/api/portraits/women/7.jpg",
    "name": "Maya",
    "online": true,
    "story": true,
  },
  {
    "img": "https://randomuser.me/api/portraits/men/8.jpg",
    "name": "Liam",
    "online": false,
    "story": false,
  },
];

// Sample user messages
const List userMessages = [
  {
    "img": "https://randomuser.me/api/portraits/women/9.jpg",
    "name": "Emma",
    "message": "Hey, how are you?",
    "created_at": "2m ago",
    "story": true,
    "online": true,
  },
  {
    "img": "https://randomuser.me/api/portraits/men/10.jpg",
    "name": "Noah",
    "message": "Let's catch up tomorrow.",
    "created_at": "10m ago",
    "story": false,
    "online": false,
  },
  {
    "img": "https://randomuser.me/api/portraits/women/11.jpg",
    "name": "Olivia",
    "message": "Loved your last photo!",
    "created_at": "30m ago",
    "story": true,
    "online": true,
  },
];

class ChatPage extends StatefulWidget {
  @override
  _ChatPageState createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // replaced ColorConstants.kWhite
      body: getBody(),
    );
  }

  Widget getBody() {
    var size = MediaQuery.of(context).size;

    return ListView(
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Text(
                "Messages",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue, // replaced ColorConstants.kPrimary
                ),
              ),
              Container(
                height: 25,
                width: 1,
                color: Colors.black.withOpacity(0.15),
              ),
              Text(
                "Matches",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black.withOpacity(0.5),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 10),
        Divider(thickness: 0.8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Container(
            height: 38,
            decoration: BoxDecoration(
              color: Colors.grey.withOpacity(0.2),
              borderRadius: BorderRadius.circular(5),
            ),
            child: TextField(
              cursorColor: Colors.black.withOpacity(0.5),
              decoration: InputDecoration(
                border: InputBorder.none,
                prefixIcon: Icon(
                  Icons.search,
                  color: Colors.black.withOpacity(0.5),
                ),
                hintText: "Search 0 Matches",
              ),
            ),
          ),
        ),
        Divider(thickness: 0.8),
        SizedBox(height: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 15),
              child: Text(
                "New Matches",
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: Colors.blue,
                ),
              ),
            ),
            SizedBox(height: 20),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Padding(
                padding: const EdgeInsets.only(left: 15),
                child: Row(
                  children: List.generate(chats_json.length, (index) {
                    final chat = chats_json[index];
                    return Padding(
                      padding: const EdgeInsets.only(right: 20),
                      child: Column(
                        children: [
                          Stack(
                            children: [
                              chat['story']
                                  ? Container(
                                    width: 70,
                                    height: 70,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.blue,
                                        width: 3,
                                      ),
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(3),
                                      child: CircleAvatar(
                                        radius: 32,
                                        backgroundImage: NetworkImage(
                                          chat['img'],
                                        ),
                                      ),
                                    ),
                                  )
                                  : CircleAvatar(
                                    radius: 32,
                                    backgroundImage: NetworkImage(chat['img']),
                                  ),
                              chat['online']
                                  ? Positioned(
                                    top: 48,
                                    left: 52,
                                    child: Container(
                                      width: 20,
                                      height: 20,
                                      decoration: BoxDecoration(
                                        color: Colors.green,
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: Colors.white,
                                          width: 3,
                                        ),
                                      ),
                                    ),
                                  )
                                  : Container(),
                            ],
                          ),
                          SizedBox(height: 10),
                          SizedBox(
                            width: 70,
                            child: Text(
                              chat['name'],
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ),
              ),
            ),
            SizedBox(height: 30),
            Padding(
              padding: const EdgeInsets.only(left: 15),
              child: Column(
                children: List.generate(userMessages.length, (index) {
                  final msg = userMessages[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: Row(
                      children: [
                        Stack(
                          children: [
                            msg['story']
                                ? Container(
                                  width: 70,
                                  height: 70,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.blue,
                                      width: 3,
                                    ),
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(3),
                                    child: CircleAvatar(
                                      radius: 32,
                                      backgroundImage: NetworkImage(msg['img']),
                                    ),
                                  ),
                                )
                                : CircleAvatar(
                                  radius: 32,
                                  backgroundImage: NetworkImage(msg['img']),
                                ),
                            msg['online']
                                ? Positioned(
                                  top: 48,
                                  left: 52,
                                  child: Container(
                                    width: 20,
                                    height: 20,
                                    decoration: BoxDecoration(
                                      color: Colors.green,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
                                        width: 3,
                                      ),
                                    ),
                                  ),
                                )
                                : Container(),
                          ],
                        ),
                        SizedBox(width: 20),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              msg['name'],
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            SizedBox(height: 5),
                            SizedBox(
                              width: MediaQuery.of(context).size.width - 135,
                              child: Text(
                                "${msg['message']} - ${msg['created_at']}",
                                style: TextStyle(
                                  fontSize: 15,
                                  color: Colors.black.withOpacity(0.8),
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
