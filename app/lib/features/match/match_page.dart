import 'package:flutter/material.dart';
import 'package:swipe_cards/draggable_card.dart';
import 'package:swipe_cards/swipe_cards.dart';

// Sample color constants
class ColorConstants {
  static const kWhite = Colors.white;
  static const kBlack = Colors.black;
  static const kGreen = Colors.green;
  static const kPrimary = Colors.blue;
}

const List item_icons = [
  {"icon": Icons.refresh, "size": 60.0, "icon_size": 28.0},
  {"icon": Icons.close, "size": 60.0, "icon_size": 28.0},
  {"icon": Icons.star, "size": 60.0, "icon_size": 28.0},
  {"icon": Icons.favorite, "size": 60.0, "icon_size": 28.0},
];
// Sample explore_json with network images
const List explore_json = [
  {
    "img": "https://randomuser.me/api/portraits/women/1.jpg",
    "name": "Ayo",
    "age": "20",
    "likes": ["Dancing", "Cooking", "Art"],
  },
  {
    "img": "https://randomuser.me/api/portraits/women/2.jpg",
    "name": "Rondeau",
    "age": "18",
    "likes": ["Instagram", "Cooking"],
  },
  {
    "img": "https://randomuser.me/api/portraits/women/3.jpg",
    "name": "Valerie",
    "age": "22",
    "likes": ["Instagram", "Netflix", "Comedy"],
  },
  {
    "img": "https://randomuser.me/api/portraits/women/4.jpg",
    "name": "Mary",
    "age": "22",
    "likes": ["Travel", "Fashion", "Reading"],
  },
];

class MatchPage extends StatefulWidget {
  @override
  _MatchPageState createState() => _MatchPageState();
}

class _MatchPageState extends State<MatchPage> {
  late MatchEngine _matchEngine;
  final List<SwipeItem> _swipeItems = [];
  List itemsTemp = [];

  @override
  void initState() {
    super.initState();
    itemsTemp = explore_json;

    for (var user in itemsTemp) {
      _swipeItems.add(
        SwipeItem(
          content: user,
          likeAction: () {
            print("${user['name']} liked");
          },
          nopeAction: () {
            print("${user['name']} disliked");
          },
        ),
      );
    }

    _matchEngine = MatchEngine(swipeItems: _swipeItems);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ColorConstants.kWhite,
      body: getBody(),
      bottomSheet: getBottomSheet(),
    );
  }

  Widget getBody() {
    var size = MediaQuery.of(context).size;

    return Padding(
      padding: const EdgeInsets.only(bottom: 120),
      child: SwipeCards(
        matchEngine: _matchEngine,
        itemBuilder: (BuildContext context, int index) {
          final user = itemsTemp[index];
          return Card(
            elevation: 5,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Stack(
                children: [
                  // User Image
                  Container(
                    width: size.width,
                    height: size.height,
                    child: Image.network(
                      user['img'],
                      fit: BoxFit.cover,
                      loadingBuilder: (context, child, progress) {
                        if (progress == null) return child;
                        return Center(child: CircularProgressIndicator());
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Center(
                          child: Icon(Icons.error, size: 50, color: Colors.red),
                        );
                      },
                    ),
                  ),
                  // Gradient Overlay
                  Container(
                    width: size.width,
                    height: size.height,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          ColorConstants.kBlack.withOpacity(0.25),
                          ColorConstants.kBlack.withOpacity(0),
                        ],
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(15),
                          child: Row(
                            children: [
                              Container(
                                width: size.width * 0.72,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Name & Age
                                    Row(
                                      children: [
                                        Text(
                                          user['name'],
                                          style: TextStyle(
                                            color: ColorConstants.kWhite,
                                            fontSize: 24,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        SizedBox(width: 10),
                                        Text(
                                          user['age'],
                                          style: TextStyle(
                                            color: ColorConstants.kWhite,
                                            fontSize: 22,
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 10),
                                    // Recently Active
                                    Row(
                                      children: [
                                        Container(
                                          width: 10,
                                          height: 10,
                                          decoration: BoxDecoration(
                                            color: ColorConstants.kGreen,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        SizedBox(width: 10),
                                        Text(
                                          "Recently Active",
                                          style: TextStyle(
                                            color: ColorConstants.kWhite,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 15),
                                    // Likes Chips
                                    Row(
                                      children: List.generate(
                                        user['likes'].length,
                                        (indexLikes) {
                                          return Padding(
                                            padding: const EdgeInsets.only(
                                              right: 8,
                                            ),
                                            child: Container(
                                              decoration: BoxDecoration(
                                                border:
                                                    indexLikes == 0
                                                        ? Border.all(
                                                          color:
                                                              ColorConstants
                                                                  .kWhite,
                                                          width: 2,
                                                        )
                                                        : null,
                                                borderRadius:
                                                    BorderRadius.circular(30),
                                                color: ColorConstants.kWhite
                                                    .withOpacity(
                                                      indexLikes == 0
                                                          ? 0.4
                                                          : 0.2,
                                                    ),
                                              ),
                                              child: Padding(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 10,
                                                      vertical: 3,
                                                    ),
                                                child: Text(
                                                  user['likes'][indexLikes],
                                                  style: TextStyle(
                                                    color:
                                                        ColorConstants.kWhite,
                                                  ),
                                                ),
                                              ),
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              // Info Icon
                              Expanded(
                                child: Center(
                                  child: Icon(
                                    Icons.info,
                                    color: ColorConstants.kWhite,
                                    size: 28,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        onStackFinished: () {
          print("No more cards");
        },
        itemChanged: (SwipeItem item, int index) {
          print("Card changed to ${item.content['name']}");
        },
        upSwipeAllowed: false,
        fillSpace: true,
      ),
    );
  }

  Widget getBottomSheet() {
    var size = MediaQuery.of(context).size;
    return Container(
      width: size.width,
      height: 120,
      decoration: BoxDecoration(color: ColorConstants.kWhite),
      child: Padding(
        padding: const EdgeInsets.only(left: 20, right: 20, bottom: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(item_icons.length, (index) {
            return Container(
              width: item_icons[index]['size'],
              height: item_icons[index]['size'],
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: ColorConstants.kWhite,
                boxShadow: [
                  BoxShadow(
                    color: ColorConstants.kBlack.withOpacity(0.1),
                    spreadRadius: 5,
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  Icons
                      .refresh, // Replace with Icons.close, Icons.star, Icons.favorite, etc.
                  size: item_icons[index]['icon_size'],
                  color: ColorConstants.kPrimary,
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
