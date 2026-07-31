#!/usr/bin/env python3
"""Import 8/1 QT content into database directly (upsert)."""
import socket
import paramiko

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080

# 8月1日 灵修内容，按 7月31号 格式整理
# scriptureText: 节号+空格+中文 / 换行英文，节间空行
# commentary: 小节标题独占一行，小节间空行
# hymn: 第一行诗歌名，后续歌词，最后 — 来源

SCRIPTURE_TEXT = """1 耶和华的话临到我说：
1 The word of the LORD came to me:

2「人子啊，你要向以色列的牧人发预言，攻击他们，说：『主耶和华如此说：「祸哉！以色列的牧人只知牧养自己。牧人岂不当牧养群羊吗？」』
2 "Son of man, prophesy against the shepherds of Israel; prophesy and say to them: 'This is what the Sovereign LORD says: Woe to you shepherds of Israel who only take care of yourselves! Should not shepherds take care of the flock?

3 你们吃脂油、穿羊毛、宰肥壮的，却不牧养群羊。
3 You eat the curds, clothe yourselves with the wool and slaughter the choice animals, but you do not take care of the flock.

4 瘦弱的，你们没有养壮；有病的，你们没有医治；受伤的，你们没有缠裹；被逐的，你们没有领回；失丧的，你们没有寻找；但用强暴严严地辖制。
4 You have not strengthened the weak or healed the sick or bound up the injured. You have not brought back the strays or searched for the lost. You have ruled them harshly and brutally.

5 因无牧人，羊就分散；既分散，便作了一切野兽的食物。
5 So they were scattered because there was no shepherd, and when they were scattered they became food for all the wild animals.

6 我的羊在诸山间、在各高冈上流离，在全地上分散，无人去寻，无人去找。
6 My sheep wandered over all the mountains and on every high hill. They were scattered over the whole earth, and no one searched or looked for them.

7 所以，你们这些牧人要听耶和华的话。」
7 "Therefore, you shepherds, hear the word of the LORD:

8 主耶和华说：「我指着我的永生起誓，我的羊因无牧人就成为掠物，也作了一切野兽的食物。我的牧人不寻找我的羊；这些牧人只知牧养自己，并不牧养我的羊。
8 As surely as I live, declares the Sovereign LORD, because my flock lacks a shepherd and so has been plundered and has become food for all the wild animals, and because my shepherds did not search for my flock but cared for themselves rather than for my flock,

9 所以你们这些牧人要听耶和华的话。」
9 therefore, you shepherds, hear the word of the LORD:

10 主耶和华如此说：「我必与牧人为敌，必向他们的手追讨我的羊，使他们不再牧放群羊；牧人也不再牧养自己。我必救我的羊脱离他们的口，不再作他们的食物。」
10 This is what the Sovereign LORD says: I am against the shepherds and will hold them accountable for my flock. I will remove them from tending the flock so that the shepherds can no longer feed themselves. I will rescue my flock from their mouths, and it will no longer be food for them."""

COMMENTARY = """今日经文摘要
神向不牧养羊群、只顾自己饱足的以色列牧人宣告祸患。他们不寻找失丧的人，反倒用暴力辖制，致使没有牧人的羊群流离失所，成了野兽的食物。因此，神必与这些牧人为敌，并要救羊脱离他们的口，不再作他们的食物。

只顾自己饱足的以色列牧人｜34：1～6
牧人喂养羊群本是理所当然，领袖也应尽责照顾神的百姓。然而神称以色列的领袖为「牧人」，并向他们宣告祸患，因为他们只追求自己的利益，却不照顾百姓。以色列的牧人宰杀肥羊，吃脂油，穿羊毛做成的衣服，却不喂养羊群。他们不扶助瘦弱的人，不医治患病的人，不缠裹受伤的人，不领回被逐的人，也不寻找失丧的人，反而用强压与暴力辖制他们。正因为缺乏真正的领袖，以色列百姓才四散各地，成了列国野兽的食物，并被掳走。神称受苦的百姓为「我的羊」（6节），将痛苦的他们抱在怀中。只寻求自己利益、却不照顾百姓的领袖，必遭神的公义管教。

神向以色列领袖宣告祸患的原因是什么？为了不成为不负责任的领袖，我应当以怜悯眷顾的人是谁？

神与以色列的牧人为敌｜34：7～10
神称领袖为「我的牧人」，称百姓为「我的羊」（8节）。即使他们是只顾填饱自己肚腹的领袖，神仍称他们为「我的牧人」，旨在提醒他们乃是代表神的牧人，因此应当尽责照顾神的百姓。神宣告必与不照顾百姓、不负责任的牧人「为敌」（10节）。祂要亲自拯救交托给他们的羊群，使百姓不再成为强暴之人的食物。神的百姓由神负责。神是不忽略百姓痛苦、必定使他们恢复的好牧人。

神称领袖为「我的牧人」，原因为何？在家庭、教会或职场等地方，神交托给我的责任是什么？

今日祷告
神啊，感谢祢亲自成为牧人，医治并引导我这受伤又迷失的生命。求祢赦免我，因我对祢交托我的羊群冷漠或不负责任。求祢引导我，使我成为忠心的牧人，为了灵魂得救，毫不吝惜地献上心力、时间和财物。

默想散文
专注于一个灵魂的牧者
传道同工的基础

「牧养」并非讲求技巧、追求华丽、令人眼花缭乱的事奉，而是深切珍视并以爱照顾神所托付的每个灵魂。那是真实地走入一个人的生命，与他一同吃饭，以真理的话语悉心养育。只要专注于牧养的本质，事奉就必会结出美好的果子。

在教会学校的学生中，有些孩子称呼事奉者为「爸爸」，因为他们所领受的爱，甚至超越了原生父母给予的爱。那样的爱不但改变了孩子们的生活与处事态度，更重塑他们的人生标竿。

我曾参加某间教会的青年团契聚会。讲道前，有一位青年献诗歌，但他的歌唱实力并不突出，甚至可说是我听过最为生涩的献诗。然而在献诗结束后，负责的传道同工却这样说：「方才献诗的那位弟兄，是我们教会初熟的果子。他洗礼，这是他生平第一次活跃而接受耶稣、领受洗礼，透过教会传福音的活动而受洗。那天的献诗，成了无可比拟、极其宝贵的生命果子。」

专注于牧养，必然会看见生命的果子。那果子绝非追求数据的增长，而是灵魂真实的改变。当你得着这样的果子，便会领悟教会事奉的真正价值。当你见证一个灵魂的改变，那个事奉便会使你得着更大的力量。盼望教会能有更多回归牧养本质的牧者，秉持着赤诚心志，将所有力量都倾注在照顾并养育每一个珍贵的灵魂之上。

一节默想
以西结书34：8｜牧养灵魂的职分并非特权，而是必须承担的责任。神向忘本分的领袖发怒，甚至指着祂的永生起誓。属灵的牧养灵魂不是追逐掌声名利，而是可能将灵魂推向死亡的哀恸。牧者受神托付必须领人归向神。倘若要承担职分，最核心的品格就是对神所交托之人的「怜悯」。

牧人（2节）：指君王或官长等领袖。
脂油（3节）：原作为献祭之用，此处暗讽领袖搜刮极大的私利。
全年读经 □士15 □徒19 □耶28 □可14

如果怜悯软弱之人的心
就不能成为
好领袖"""

HYMN = """主祢真实
如阳光每早晨都升起照亮，喔主祢真实，
主祢信实。赐春雨浇灌地，祢也赐每个气息，祢何等信实。我见十架，知祢付代价，
我见宝血，知我罪已得洁净。在狂风暴雨之中，虽经历风浪，主祢仍信实……。

— 三一敬拜系列2《直到列国万民看见主》"""


def make_proxy_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(30)
    s.connect((PROXY_HOST, PROXY_PORT))
    req = f"CONNECT {HOST}:{PORT} HTTP/1.1\r\nHost: {HOST}:{PORT}\r\n\r\n".encode()
    s.sendall(req)
    data = s.recv(4096)
    if b"200" not in data.split(b"\r\n")[0]:
        raise RuntimeError(f"Proxy CONNECT failed: {data[:200]!r}")
    return s


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)

    # Build parameterized SQL to avoid escaping hell. Use psql -c with dollar-quoted strings.
    # upsert: if 2026-08-01 exists, update; else insert.
    import uuid
    new_id = str(uuid.uuid4())

    # Use a temp file to pass values safely via COPY-like approach is complex;
    # instead use psql variables with \set and dollar-quoting for content.
    # Simpler: write a SQL file to remote, then execute it.

    sql = f"""-- Upsert 8/1 QT content
INSERT INTO qt_daily_contents (id, qt_date, title, scripture_reference, scripture_text, commentary, hymn, title_ko, scripture_reference_ko, scripture_text_ko, commentary_ko, hymn_ko)
VALUES (
  '{new_id}'::uuid,
  '2026-08-01'::date,
  '不负责任的领袖，有祸了',
  '以西结书 34:1~10',
  $txt${SCRIPTURE_TEXT}$txt$,
  $com${COMMENTARY}$com$,
  $hym${HYMN}$hym$,
  NULL, NULL, NULL, NULL, NULL
)
ON CONFLICT (qt_date) DO UPDATE SET
  title = EXCLUDED.title,
  scripture_reference = EXCLUDED.scripture_reference,
  scripture_text = EXCLUDED.scripture_text,
  commentary = EXCLUDED.commentary,
  hymn = EXCLUDED.hymn;
"""

    # Write SQL to remote temp file
    sftp = client.open_sftp()
    with sftp.file('/tmp/import_0801.sql', 'w') as f:
        f.write(sql)
    sftp.close()
    print("SQL file written to /tmp/import_0801.sql")

    # Check if ON CONFLICT (qt_date) is supported (needs unique constraint on qt_date)
    # First check table constraints
    check_cmd = r"""docker exec bible-postgres psql -U bible_user -d bible -t -A -c "SELECT conname, contype FROM pg_constraint con JOIN pg_class rel ON rel.oid = con.conrelid WHERE rel.relname = 'qt_daily_contents';" """
    print("\n=== constraints on qt_daily_contents ===")
    stdin, stdout, stderr = client.exec_command(check_cmd, timeout=30)
    print(stdout.read().decode('utf-8', errors='replace'))
    err = stderr.read().decode('utf-8', errors='replace')
    if err.strip():
        print(f"[stderr] {err}")

    # Execute the SQL file
    exec_cmd = "docker exec -i bible-postgres psql -U bible_user -d bible -f /dev/stdin < /tmp/import_0801.sql"
    print("\n=== executing import ===")
    stdin, stdout, stderr = client.exec_command(exec_cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    print(out)
    if err.strip():
        print(f"[stderr] {err}")
    print(f"[exit={code}]")

    # Verify
    verify_cmd = """docker exec bible-postgres psql -U bible_user -d bible -t -A -c "SELECT qt_date, title, scripture_reference, length(scripture_text) as st_len, length(commentary) as com_len, length(hymn) as hymn_len FROM qt_daily_contents WHERE qt_date = '2026-08-01';" """
    print("\n=== verify 8/1 ===")
    stdin, stdout, stderr = client.exec_command(verify_cmd, timeout=30)
    print(stdout.read().decode('utf-8', errors='replace'))

    # cleanup
    client.exec_command("rm -f /tmp/import_0801.sql")
    client.close()


if __name__ == "__main__":
    main()
