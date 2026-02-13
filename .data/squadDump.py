"""Export MFL competition standings to CSV.

The script fetches a hardcoded competition, enriches standings rows with club
names and played match IDs, and writes one CSV row per club.
"""

from __future__ import annotations

import csv
import json
import re
import sys
import time
import unicodedata
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

API_BASE = "https://z519wdyajg.execute-api.us-east-1.amazonaws.com/prod"
# COMPETITION_ID = 10513
COMPETITION_ID = 10696
# COMPETITION_ID = 10617
FETCH_MAX_ATTEMPTS = 4
FETCH_BACKOFF_SECONDS = 1.5
MATCH_FETCHES_PER_SECOND = 2.0
MATCH_FETCH_INTERVAL_SECONDS = 1.0 / MATCH_FETCHES_PER_SECOND

CSV_COLUMNS = [
    "clubStanding",
    "clubId",
    "clubName",
    "wins",
    "draws",
    "losses",
    "points",
    "goals",
    "goalsAgainst",
    "matchIds",
]

MATCHES_HOME_OVERALL_COLUMNS = [f"homeP{idx}Overall" for idx in range(1, 12)]
MATCHES_AWAY_OVERALL_COLUMNS = [f"awayP{idx}Overall" for idx in range(1, 12)]
MATCH_PLAYER_DATA_SUFFIXES = [
    "Id",
    "DataVersion",
    "Defense",
    "Dribbling",
    "Pace",
    "Passing",
    "Physical",
    "Shooting",
    "Goalkeeping",
    "Energy",
    "Pos1",
    "Pos2",
    "Pos3",
    "Position",
    "PositionCode",
]
MATCHES_HOME_PLAYER_DATA_COLUMNS = [
    f"homeP{idx}{suffix}"
    for idx in range(1, 12)
    for suffix in MATCH_PLAYER_DATA_SUFFIXES
]
MATCHES_AWAY_PLAYER_DATA_COLUMNS = [
    f"awayP{idx}{suffix}"
    for idx in range(1, 12)
    for suffix in MATCH_PLAYER_DATA_SUFFIXES
]
MATCHES_CSV_COLUMNS = [
    "matchId",
    "status",
    "startDate",
    "engine",
    "homeClubId",
    "homeTeamName",
    "awayClubId",
    "awayTeamName",
    "homeScore",
    "awayScore",
    "result",
    "winnerClubId",
    "winnerTeamName",
    "goalDifference",
    "homeFormation",
    "awayFormation",
    "homeCaptainId",
    "awayCaptainId",
    *MATCHES_HOME_OVERALL_COLUMNS,
    *MATCHES_AWAY_OVERALL_COLUMNS,
    *MATCHES_HOME_PLAYER_DATA_COLUMNS,
    *MATCHES_AWAY_PLAYER_DATA_COLUMNS,
]

# Position attribute weights mirrored from mfl-info-app/src/constants/positions.js
POSITION_ATTRIBUTE_WEIGHTS = {
    "ST": {
        "passing": 0.10,
        "shooting": 0.46,
        "defense": 0.00,
        "dribbling": 0.29,
        "pace": 0.10,
        "physical": 0.05,
        "goalkeeping": 0.00,
    },
    "CF": {
        "passing": 0.24,
        "shooting": 0.23,
        "defense": 0.00,
        "dribbling": 0.40,
        "pace": 0.13,
        "physical": 0.00,
        "goalkeeping": 0.00,
    },
    "LW": {
        "passing": 0.24,
        "shooting": 0.23,
        "defense": 0.00,
        "dribbling": 0.40,
        "pace": 0.13,
        "physical": 0.00,
        "goalkeeping": 0.00,
    },
    "RW": {
        "passing": 0.24,
        "shooting": 0.23,
        "defense": 0.00,
        "dribbling": 0.40,
        "pace": 0.13,
        "physical": 0.00,
        "goalkeeping": 0.00,
    },
    "CAM": {
        "passing": 0.34,
        "shooting": 0.21,
        "defense": 0.00,
        "dribbling": 0.38,
        "pace": 0.07,
        "physical": 0.00,
        "goalkeeping": 0.00,
    },
    "CM": {
        "passing": 0.43,
        "shooting": 0.12,
        "defense": 0.10,
        "dribbling": 0.29,
        "pace": 0.00,
        "physical": 0.06,
        "goalkeeping": 0.00,
    },
    "LM": {
        "passing": 0.43,
        "shooting": 0.12,
        "defense": 0.10,
        "dribbling": 0.29,
        "pace": 0.00,
        "physical": 0.06,
        "goalkeeping": 0.00,
    },
    "RM": {
        "passing": 0.43,
        "shooting": 0.12,
        "defense": 0.10,
        "dribbling": 0.29,
        "pace": 0.00,
        "physical": 0.06,
        "goalkeeping": 0.00,
    },
    "CDM": {
        "passing": 0.28,
        "shooting": 0.00,
        "defense": 0.40,
        "dribbling": 0.17,
        "pace": 0.00,
        "physical": 0.15,
        "goalkeeping": 0.00,
    },
    "LWB": {
        "passing": 0.19,
        "shooting": 0.00,
        "defense": 0.44,
        "dribbling": 0.17,
        "pace": 0.10,
        "physical": 0.10,
        "goalkeeping": 0.00,
    },
    "RWB": {
        "passing": 0.19,
        "shooting": 0.00,
        "defense": 0.44,
        "dribbling": 0.17,
        "pace": 0.10,
        "physical": 0.10,
        "goalkeeping": 0.00,
    },
    "LB": {
        "passing": 0.19,
        "shooting": 0.00,
        "defense": 0.44,
        "dribbling": 0.17,
        "pace": 0.10,
        "physical": 0.10,
        "goalkeeping": 0.00,
    },
    "RB": {
        "passing": 0.19,
        "shooting": 0.00,
        "defense": 0.44,
        "dribbling": 0.17,
        "pace": 0.10,
        "physical": 0.10,
        "goalkeeping": 0.00,
    },
    "CB": {
        "passing": 0.05,
        "shooting": 0.00,
        "defense": 0.64,
        "dribbling": 0.09,
        "pace": 0.02,
        "physical": 0.20,
        "goalkeeping": 0.00,
    },
    "GK": {
        "passing": 0.00,
        "shooting": 0.00,
        "defense": 0.00,
        "dribbling": 0.00,
        "pace": 0.00,
        "physical": 0.00,
        "goalkeeping": 1.00,
    },
}

PLAYER_BASE_COLUMNS = [
    "id",
    "firstName",
    "lastName",
    "overall",
    "nationality",
    "primaryPosition",
    "secondaryPosition",
    "tertiaryPosition",
    "secondaryOverall",
    "tertiaryOverall",
    "maxOverall",
    "preferredFoot",
    "age",
    "height",
    "pace",
    "shooting",
    "passing",
    "dribbling",
    "defense",
    "physical",
    "goalkeeping",
    "retirementYears",
    "energy",
    "nbSeasonYellows",
    "ownerMatchesClubOwner",
    "revenueShare",
    "totalRevenueShare",
    "nbMatches",
    "revenueSharePenalty",
    "autoAccept",
]


def fetch_json(url: str) -> Any:
    """Fetch and decode JSON from the given URL."""
    for attempt in range(1, FETCH_MAX_ATTEMPTS + 1):
        try:
            with urlopen(url, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            should_retry = exc.code in {408, 425, 429, 500, 502, 503, 504}
            if should_retry and attempt < FETCH_MAX_ATTEMPTS:
                time.sleep(FETCH_BACKOFF_SECONDS * attempt)
                continue
            raise RuntimeError(f"HTTP {exc.code} while fetching {url}") from exc
        except URLError as exc:
            if attempt < FETCH_MAX_ATTEMPTS:
                time.sleep(FETCH_BACKOFF_SECONDS * attempt)
                continue
            raise RuntimeError(f"Network error while fetching {url}: {exc.reason}") from exc
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Invalid JSON received from {url}") from exc

    raise RuntimeError(f"Failed to fetch {url} after {FETCH_MAX_ATTEMPTS} attempts.")


def normalize_ascii(text: str) -> str:
    """Normalize text to lowercase ASCII-friendly tokens."""
    normalized = unicodedata.normalize("NFKD", text)
    normalized = normalized.replace("\u2013", " ").replace("\u2014", " ")
    normalized = normalized.encode("ascii", "ignore").decode("ascii")
    return normalized.lower()


def build_competition_token(competition_name: str) -> str:
    """Create token like 'iron_4' from names like 'Iron - League 4'."""
    normalized = normalize_ascii(competition_name)
    alpha_tokens = re.findall(r"[a-z]+", normalized)
    num_tokens = re.findall(r"\d+", normalized)

    if alpha_tokens and num_tokens:
        return f"{alpha_tokens[0]}_{num_tokens[-1]}"

    all_tokens = re.findall(r"[a-z0-9]+", normalized)
    if all_tokens:
        return "_".join(all_tokens)

    return "competition"


def build_season_token(season_name: str) -> str:
    """Create token like 's11' from names like 'Season 11'."""
    normalized = normalize_ascii(season_name)
    match = re.search(r"\d+", normalized)
    if match:
        return f"s{match.group(0)}"

    tokens = re.findall(r"[a-z0-9]+", normalized)
    if tokens:
        return "_".join(tokens)

    return "season"


def get_standings_groups(competition: dict[str, Any]) -> list[dict[str, Any]]:
    """Return all standings groups from schedule stages."""
    schedule = competition.get("schedule")
    if not isinstance(schedule, dict):
        raise RuntimeError("Competition payload missing 'schedule'.")

    stages = schedule.get("stages")
    if not isinstance(stages, list) or not stages:
        raise RuntimeError("Competition payload missing schedule stages.")

    groups: list[dict[str, Any]] = []
    for stage in stages:
        stage_groups = stage.get("groups")
        if not isinstance(stage_groups, list):
            continue
        for group in stage_groups:
            if isinstance(group, dict):
                groups.append(group)

    if not groups:
        raise RuntimeError("No standings groups found in competition schedule.")

    return groups


def collect_members(groups: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Collect member entries in API order across all groups."""
    members: list[dict[str, Any]] = []
    for group in groups:
        group_members = group.get("members")
        if not isinstance(group_members, list):
            continue
        for member in group_members:
            if isinstance(member, dict):
                members.append(member)
    if not members:
        raise RuntimeError("No standings members found in groups.")
    return members


def add_match_id(
    club_match_ids: dict[int, list[int]],
    seen_ids: dict[int, set[int]],
    club_id: Any,
    match_id: Any,
) -> None:
    """Add one match ID to a club list with deduplication."""
    if not isinstance(club_id, int):
        return
    if not isinstance(match_id, int):
        return

    if club_id not in club_match_ids:
        club_match_ids[club_id] = []
    if club_id not in seen_ids:
        seen_ids[club_id] = set()

    if match_id not in seen_ids[club_id]:
        seen_ids[club_id].add(match_id)
        club_match_ids[club_id].append(match_id)


def collect_match_ids(groups: list[dict[str, Any]]) -> dict[int, list[int]]:
    """Map clubId -> list of played match IDs (status == ENDED)."""
    club_match_ids: dict[int, list[int]] = {}
    seen_ids: dict[int, set[int]] = {}

    for group in groups:
        rounds = group.get("rounds")
        if not isinstance(rounds, list):
            continue

        for round_info in rounds:
            matches = round_info.get("matches") if isinstance(round_info, dict) else None
            if not isinstance(matches, list):
                continue

            for match in matches:
                if not isinstance(match, dict):
                    continue
                if match.get("status") != "ENDED":
                    continue
                match_id = match.get("matchId")
                add_match_id(club_match_ids, seen_ids, match.get("homeClubId"), match_id)
                add_match_id(club_match_ids, seen_ids, match.get("awayClubId"), match_id)

    return club_match_ids


def collect_competition_match_ids(groups: list[dict[str, Any]]) -> set[int]:
    """Collect unique played match IDs across all clubs in the competition."""
    club_match_ids = collect_match_ids(groups)
    return {
        match_id
        for club_ids in club_match_ids.values()
        for match_id in club_ids
        if isinstance(match_id, int)
    }


def fetch_club_info(club_id: int, cache: dict[int, dict[str, Any]]) -> dict[str, Any]:
    """Fetch and cache full club payload for a club ID."""
    if club_id in cache:
        return cache[club_id]

    url = f"{API_BASE}/clubs/{club_id}"
    club_data = fetch_json(url)
    if not isinstance(club_data, dict):
        raise RuntimeError(f"Club payload is not an object for clubId={club_id}.")
    cache[club_id] = club_data
    return club_data


def fetch_club_players(club_id: int) -> list[dict[str, Any]]:
    """Fetch club players from /clubs/{clubId}/players."""
    url = f"{API_BASE}/clubs/{club_id}/players"
    players = fetch_json(url)
    if not isinstance(players, list):
        raise RuntimeError(f"Players payload is not a list for clubId={club_id}.")
    for idx, player in enumerate(players, start=1):
        if not isinstance(player, dict):
            raise RuntimeError(
                f"Invalid player payload item at index {idx} for clubId={club_id}."
            )
    return players


def parse_number(value: Any) -> float | None:
    """Convert numeric-like values to float."""
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str) and value.strip() and value != "N/A":
        try:
            return float(value)
        except ValueError:
            return None
    return None


def parse_int(value: Any) -> int | None:
    """Convert numeric-like values to int while ignoring booleans."""
    if isinstance(value, bool):
        return None
    parsed = parse_number(value)
    if parsed is None:
        return None
    return int(round(parsed))


def calculate_position_rating(
    metadata: dict[str, Any],
    primary_position: str,
    target_position: str,
    is_secondary: bool = False,
) -> int | None:
    """Calculate a position rating using the same weighting approach as the app."""
    weights = POSITION_ATTRIBUTE_WEIGHTS.get(target_position)
    if not weights:
        return None

    rating = 0.0
    for attribute, weight in weights.items():
        value = parse_number(metadata.get(attribute))
        if value is not None:
            rating += value * weight

    penalty = 0
    if primary_position != target_position and is_secondary:
        penalty = -1

    return round(rating + penalty)


def extract_clause_values(active_contract: dict[str, Any]) -> tuple[Any, Any]:
    """Extract nbMatches and revenueSharePenalty from activeContract.clauses."""
    clauses = active_contract.get("clauses")
    if not isinstance(clauses, list):
        return (None, None)

    candidate: dict[str, Any] | None = None
    for clause in clauses:
        if (
            isinstance(clause, dict)
            and clause.get("status") == "ACTIVE"
            and ("nbMatches" in clause or "revenueSharePenalty" in clause)
        ):
            candidate = clause
            break

    if candidate is None:
        for clause in clauses:
            if isinstance(clause, dict) and (
                "nbMatches" in clause or "revenueSharePenalty" in clause
            ):
                candidate = clause
                break

    if candidate is None:
        return (None, None)
    return (candidate.get("nbMatches"), candidate.get("revenueSharePenalty"))


def derive_auto_accept(player: dict[str, Any]) -> bool:
    """Derive autoAccept boolean from offer preferences."""
    if isinstance(player.get("autoAccept"), bool):
        return player["autoAccept"]

    offer_preferences = player.get("offerPreferences")
    if not isinstance(offer_preferences, list):
        return False

    for pref in offer_preferences:
        if isinstance(pref, dict) and pref.get("autoAccept") is True:
            return True
    return False


def player_to_csv_row(player: dict[str, Any], club_owner_wallet: str | None) -> dict[str, Any]:
    """Convert one player payload into curated CSV row format."""
    metadata = player.get("metadata") if isinstance(player.get("metadata"), dict) else {}
    stats = player.get("stats") if isinstance(player.get("stats"), dict) else {}
    owned_by = player.get("ownedBy") if isinstance(player.get("ownedBy"), dict) else {}
    active_contract = (
        player.get("activeContract")
        if isinstance(player.get("activeContract"), dict)
        else {}
    )

    nationalities = metadata.get("nationalities")
    nationality = nationalities[0] if isinstance(nationalities, list) and nationalities else None

    positions = metadata.get("positions")
    if isinstance(positions, list):
        clean_positions = [
            position.strip()
            for position in positions
            if isinstance(position, str) and position.strip()
        ]
    else:
        clean_positions = []

    primary_position = clean_positions[0] if len(clean_positions) > 0 else None
    secondary_position = clean_positions[1] if len(clean_positions) > 1 else None
    tertiary_position = clean_positions[2] if len(clean_positions) > 2 else None

    secondary_overall = (
        calculate_position_rating(metadata, primary_position, secondary_position, True)
        if primary_position and secondary_position
        else None
    )
    tertiary_overall = (
        calculate_position_rating(metadata, primary_position, tertiary_position, True)
        if primary_position and tertiary_position
        else None
    )
    overall_value = parse_number(metadata.get("overall"))
    rating_candidates = [
        overall_value,
        parse_number(secondary_overall),
        parse_number(tertiary_overall),
    ]
    max_overall = max((int(value) for value in rating_candidates if value is not None), default=None)

    player_owner_wallet = owned_by.get("walletAddress")
    owner_matches_club_owner = bool(
        isinstance(player_owner_wallet, str)
        and isinstance(club_owner_wallet, str)
        and player_owner_wallet == club_owner_wallet
    )

    clause_nb_matches, clause_revenue_share_penalty = extract_clause_values(active_contract)

    row: dict[str, Any] = {
        "id": player.get("id"),
        "firstName": metadata.get("firstName"),
        "lastName": metadata.get("lastName"),
        "overall": metadata.get("overall"),
        "nationality": nationality,
        "primaryPosition": primary_position,
        "secondaryPosition": secondary_position,
        "tertiaryPosition": tertiary_position,
        "secondaryOverall": secondary_overall,
        "tertiaryOverall": tertiary_overall,
        "maxOverall": max_overall,
        "preferredFoot": metadata.get("preferredFoot"),
        "age": metadata.get("age"),
        "height": metadata.get("height"),
        "pace": metadata.get("pace"),
        "shooting": metadata.get("shooting"),
        "passing": metadata.get("passing"),
        "dribbling": metadata.get("dribbling"),
        "defense": metadata.get("defense"),
        "physical": metadata.get("physical"),
        "goalkeeping": metadata.get("goalkeeping"),
        "retirementYears": metadata.get("retirementYears"),
        "energy": player.get("energy"),
        "nbSeasonYellows": player.get("nbSeasonYellows"),
        "ownerMatchesClubOwner": owner_matches_club_owner,
        "revenueShare": active_contract.get("revenueShare"),
        "totalRevenueShare": active_contract.get("totalRevenueShareLocked"),
        "nbMatches": clause_nb_matches,
        "revenueSharePenalty": clause_revenue_share_penalty,
        "autoAccept": derive_auto_accept(player),
    }

    for stat_key, stat_value in stats.items():
        if stat_key == "v":
            continue
        row[f"stats.{stat_key}"] = stat_value

    return row



def build_output_filename(competition: dict[str, Any]) -> str:
    """Create output file name like iron_4_s11.csv."""
    competition_name = competition.get("name")
    season = competition.get("season")
    season_name = season.get("name") if isinstance(season, dict) else None

    if not isinstance(competition_name, str) or not competition_name.strip():
        raise RuntimeError("Competition payload missing valid 'name'.")
    if not isinstance(season_name, str) or not season_name.strip():
        raise RuntimeError("Competition payload missing valid 'season.name'.")

    return f"{build_competition_token(competition_name)}_{build_season_token(season_name)}.csv"


def build_rows(competition: dict[str, Any]) -> list[dict[str, Any]]:
    """Build CSV rows from standings members plus enrichment data."""
    groups = get_standings_groups(competition)
    members = collect_members(groups)
    club_match_ids = collect_match_ids(groups)
    club_data_cache: dict[int, dict[str, Any]] = {}

    rows: list[dict[str, Any]] = []
    for idx, member in enumerate(members, start=1):
        club_id = member.get("clubId")
        if not isinstance(club_id, int):
            raise RuntimeError(f"Invalid or missing clubId in member at position {idx}.")

        club_data = fetch_club_info(club_id, club_data_cache)
        club_name = club_data.get("name")
        if not isinstance(club_name, str) or not club_name.strip():
            raise RuntimeError(f"Club payload missing valid name for clubId={club_id}.")
        match_ids = club_match_ids.get(club_id, [])

        row: dict[str, Any] = {
            "clubStanding": idx,
            "clubId": club_id,
            "clubName": club_name,
            "wins": member.get("wins"),
            "draws": member.get("draws"),
            "losses": member.get("losses"),
            "points": member.get("points"),
            "goals": member.get("goals"),
            "goalsAgainst": member.get("goalsAgainst"),
            "matchIds": json.dumps(match_ids),
        }
        rows.append(row)

    return rows


def write_csv(rows: list[dict[str, Any]], output_path: Path) -> None:
    """Write rows to CSV with fixed column order."""
    with output_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def write_players_csv(players: list[dict[str, Any]], output_path: Path) -> None:
    """Write one club's players to CSV, one row per player."""
    if not isinstance(players, list):
        raise RuntimeError("Expected player list while writing player CSV.")

    player_rows = players
    if not player_rows:
        with output_path.open("w", encoding="utf-8", newline="") as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=PLAYER_BASE_COLUMNS)
            writer.writeheader()
        return

    stats_keys = {
        key for row in player_rows for key in row.keys() if isinstance(key, str) and key.startswith("stats.")
    }
    fieldnames = PLAYER_BASE_COLUMNS + sorted(stats_keys)

    with output_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(player_rows)


def _extract_formation_overalls(formation: dict[str, Any]) -> list[int | None]:
    """Extract 11 player overalls from one formation by position index."""
    positions = formation.get("positions")
    if not isinstance(positions, list):
        raise RuntimeError("Match payload missing valid formation positions.")

    overalls: list[int | None] = [None] * 11
    for position in positions:
        if not isinstance(position, dict):
            continue

        index = position.get("index")
        if not isinstance(index, int) or index < 0 or index > 10:
            continue

        player = position.get("player")
        if not isinstance(player, dict):
            continue

        metadata = player.get("metadata")
        if not isinstance(metadata, dict):
            continue

        overall = parse_number(metadata.get("overall"))
        if overall is None:
            continue
        overalls[index] = int(round(overall))

    return overalls


def _extract_formation_captain_id(formation: dict[str, Any]) -> int | None:
    """Extract captain player ID from one formation."""
    positions = formation.get("positions")
    if not isinstance(positions, list):
        raise RuntimeError("Match payload missing valid formation positions.")

    for position in positions:
        if not isinstance(position, dict):
            continue
        if position.get("captain") is not True:
            continue

        player = position.get("player")
        if not isinstance(player, dict):
            continue

        player_id = player.get("id")
        if isinstance(player_id, int) and not isinstance(player_id, bool):
            return player_id

    return None


def _extract_formation_player_data(
    formation: dict[str, Any], match_players: dict[str, Any]
) -> list[dict[str, Any]]:
    """Extract player payload attributes for one formation by position index."""
    positions = formation.get("positions")
    if not isinstance(positions, list):
        raise RuntimeError("Match payload missing valid formation positions.")

    default_player_data = {
        "id": None,
        "dataVersion": None,
        "overall": None,
        "defense": None,
        "dribbling": None,
        "pace": None,
        "passing": None,
        "physical": None,
        "shooting": None,
        "goalkeeping": None,
        "energy": None,
        "pos1": None,
        "pos2": None,
        "pos3": None,
        "position": None,
        "positionCode": None,
    }
    player_data_by_slot = [default_player_data.copy() for _ in range(11)]

    for position_entry in positions:
        if not isinstance(position_entry, dict):
            continue

        index = position_entry.get("index")
        if not isinstance(index, int) or index < 0 or index > 10:
            continue

        player = position_entry.get("player")
        if not isinstance(player, dict):
            continue

        slot_data = default_player_data.copy()
        player_id = player.get("id")
        if isinstance(player_id, int) and not isinstance(player_id, bool):
            slot_data["id"] = player_id

        metadata = player.get("metadata")
        if isinstance(metadata, dict):
            metadata_overall = parse_int(metadata.get("overall"))
            if metadata_overall is not None:
                slot_data["overall"] = metadata_overall

        raw_player_data = (
            match_players.get(str(player_id))
            if isinstance(player_id, int) and not isinstance(player_id, bool)
            else None
        )
        if isinstance(raw_player_data, list):
            if len(raw_player_data) > 0:
                slot_data["dataVersion"] = parse_int(raw_player_data[0])
            if len(raw_player_data) > 1:
                player_overall = parse_int(raw_player_data[1])
                if player_overall is not None:
                    slot_data["overall"] = player_overall
            if len(raw_player_data) > 2:
                slot_data["defense"] = parse_int(raw_player_data[2])
            if len(raw_player_data) > 3:
                slot_data["dribbling"] = parse_int(raw_player_data[3])
            if len(raw_player_data) > 4:
                slot_data["pace"] = parse_int(raw_player_data[4])
            if len(raw_player_data) > 5:
                slot_data["passing"] = parse_int(raw_player_data[5])
            if len(raw_player_data) > 6:
                slot_data["physical"] = parse_int(raw_player_data[6])
            if len(raw_player_data) > 7:
                slot_data["shooting"] = parse_int(raw_player_data[7])
            if len(raw_player_data) > 8:
                slot_data["goalkeeping"] = parse_int(raw_player_data[8])
            if len(raw_player_data) > 9:
                slot_data["energy"] = parse_int(raw_player_data[9])

            raw_positions = raw_player_data[10] if len(raw_player_data) > 10 else None
            clean_positions = (
                [
                    value.strip()
                    for value in raw_positions
                    if isinstance(value, str) and value.strip()
                ]
                if isinstance(raw_positions, list)
                else []
            )
            slot_data["pos1"] = clean_positions[0] if len(clean_positions) > 0 else None
            slot_data["pos2"] = clean_positions[1] if len(clean_positions) > 1 else None
            slot_data["pos3"] = clean_positions[2] if len(clean_positions) > 2 else None

            assigned_position = raw_player_data[11] if len(raw_player_data) > 11 else None
            slot_data["position"] = (
                assigned_position.strip()
                if isinstance(assigned_position, str) and assigned_position.strip()
                else None
            )
            slot_data["positionCode"] = (
                parse_int(raw_player_data[12]) if len(raw_player_data) > 12 else None
            )

        player_data_by_slot[index] = slot_data

    return player_data_by_slot


def _build_match_row(match_id: int, match: dict[str, Any]) -> dict[str, Any]:
    """Convert one match payload into one curated CSV row."""
    status = match.get("status")
    start_date = match.get("startDate")
    home_team_name = match.get("homeTeamName")
    away_team_name = match.get("awayTeamName")
    home_score = match.get("homeScore")
    away_score = match.get("awayScore")

    if not isinstance(status, str) or not status.strip():
        raise RuntimeError(f"Match payload missing valid status for matchId={match_id}.")
    if not isinstance(start_date, str) or not start_date.strip():
        raise RuntimeError(f"Match payload missing valid startDate for matchId={match_id}.")
    if not isinstance(home_team_name, str) or not home_team_name.strip():
        raise RuntimeError(f"Match payload missing valid homeTeamName for matchId={match_id}.")
    if not isinstance(away_team_name, str) or not away_team_name.strip():
        raise RuntimeError(f"Match payload missing valid awayTeamName for matchId={match_id}.")
    if not isinstance(home_score, int):
        raise RuntimeError(f"Match payload missing valid homeScore for matchId={match_id}.")
    if not isinstance(away_score, int):
        raise RuntimeError(f"Match payload missing valid awayScore for matchId={match_id}.")

    home_formation = match.get("homeFormation")
    away_formation = match.get("awayFormation")
    if not isinstance(home_formation, dict):
        raise RuntimeError(f"Match payload missing homeFormation for matchId={match_id}.")
    if not isinstance(away_formation, dict):
        raise RuntimeError(f"Match payload missing awayFormation for matchId={match_id}.")

    home_formation_type = home_formation.get("type")
    away_formation_type = away_formation.get("type")
    if not isinstance(home_formation_type, str) or not home_formation_type.strip():
        raise RuntimeError(
            f"Match payload missing valid homeFormation.type for matchId={match_id}."
        )
    if not isinstance(away_formation_type, str) or not away_formation_type.strip():
        raise RuntimeError(
            f"Match payload missing valid awayFormation.type for matchId={match_id}."
        )

    home_squad = match.get("homeSquad")
    away_squad = match.get("awaySquad")
    if not isinstance(home_squad, dict):
        raise RuntimeError(f"Match payload missing homeSquad for matchId={match_id}.")
    if not isinstance(away_squad, dict):
        raise RuntimeError(f"Match payload missing awaySquad for matchId={match_id}.")

    home_club = home_squad.get("club")
    away_club = away_squad.get("club")
    if not isinstance(home_club, dict):
        raise RuntimeError(f"Match payload missing homeSquad.club for matchId={match_id}.")
    if not isinstance(away_club, dict):
        raise RuntimeError(f"Match payload missing awaySquad.club for matchId={match_id}.")

    home_club_id = home_club.get("id")
    away_club_id = away_club.get("id")
    if not isinstance(home_club_id, int):
        raise RuntimeError(f"Match payload missing valid homeClubId for matchId={match_id}.")
    if not isinstance(away_club_id, int):
        raise RuntimeError(f"Match payload missing valid awayClubId for matchId={match_id}.")

    match_players = match.get("players")
    if not isinstance(match_players, dict):
        raise RuntimeError(f"Match payload missing players map for matchId={match_id}.")

    home_overalls = _extract_formation_overalls(home_formation)
    away_overalls = _extract_formation_overalls(away_formation)
    home_captain_id = _extract_formation_captain_id(home_formation)
    away_captain_id = _extract_formation_captain_id(away_formation)
    home_players_data = _extract_formation_player_data(home_formation, match_players)
    away_players_data = _extract_formation_player_data(away_formation, match_players)

    winner_club_id: int | None = None
    winner_team_name: str | None = None
    if home_score > away_score:
        result = "HOME_WIN"
        winner_club_id = home_club_id
        winner_team_name = home_team_name
    elif away_score > home_score:
        result = "AWAY_WIN"
        winner_club_id = away_club_id
        winner_team_name = away_team_name
    else:
        result = "DRAW"

    engine_value = match.get("engine")
    if isinstance(engine_value, (dict, list)):
        engine = json.dumps(engine_value, separators=(",", ":"))
    elif isinstance(engine_value, (str, int, float, bool)):
        engine = str(engine_value)
    else:
        engine = None

    row: dict[str, Any] = {
        "matchId": match_id,
        "status": status,
        "startDate": start_date,
        "engine": engine,
        "homeClubId": home_club_id,
        "homeTeamName": home_team_name,
        "awayClubId": away_club_id,
        "awayTeamName": away_team_name,
        "homeScore": home_score,
        "awayScore": away_score,
        "result": result,
        "winnerClubId": winner_club_id,
        "winnerTeamName": winner_team_name,
        "goalDifference": abs(home_score - away_score),
        "homeFormation": home_formation_type,
        "awayFormation": away_formation_type,
        "homeCaptainId": home_captain_id,
        "awayCaptainId": away_captain_id,
    }

    for idx, overall in enumerate(home_overalls, start=1):
        data_overall = home_players_data[idx - 1]["overall"]
        row[f"homeP{idx}Overall"] = data_overall if data_overall is not None else overall
    for idx, overall in enumerate(away_overalls, start=1):
        data_overall = away_players_data[idx - 1]["overall"]
        row[f"awayP{idx}Overall"] = data_overall if data_overall is not None else overall

    for idx, player_data in enumerate(home_players_data, start=1):
        row[f"homeP{idx}Id"] = player_data["id"]
        row[f"homeP{idx}DataVersion"] = player_data["dataVersion"]
        row[f"homeP{idx}Defense"] = player_data["defense"]
        row[f"homeP{idx}Dribbling"] = player_data["dribbling"]
        row[f"homeP{idx}Pace"] = player_data["pace"]
        row[f"homeP{idx}Passing"] = player_data["passing"]
        row[f"homeP{idx}Physical"] = player_data["physical"]
        row[f"homeP{idx}Shooting"] = player_data["shooting"]
        row[f"homeP{idx}Goalkeeping"] = player_data["goalkeeping"]
        row[f"homeP{idx}Energy"] = player_data["energy"]
        row[f"homeP{idx}Pos1"] = player_data["pos1"]
        row[f"homeP{idx}Pos2"] = player_data["pos2"]
        row[f"homeP{idx}Pos3"] = player_data["pos3"]
        row[f"homeP{idx}Position"] = player_data["position"]
        row[f"homeP{idx}PositionCode"] = player_data["positionCode"]

    for idx, player_data in enumerate(away_players_data, start=1):
        row[f"awayP{idx}Id"] = player_data["id"]
        row[f"awayP{idx}DataVersion"] = player_data["dataVersion"]
        row[f"awayP{idx}Defense"] = player_data["defense"]
        row[f"awayP{idx}Dribbling"] = player_data["dribbling"]
        row[f"awayP{idx}Pace"] = player_data["pace"]
        row[f"awayP{idx}Passing"] = player_data["passing"]
        row[f"awayP{idx}Physical"] = player_data["physical"]
        row[f"awayP{idx}Shooting"] = player_data["shooting"]
        row[f"awayP{idx}Goalkeeping"] = player_data["goalkeeping"]
        row[f"awayP{idx}Energy"] = player_data["energy"]
        row[f"awayP{idx}Pos1"] = player_data["pos1"]
        row[f"awayP{idx}Pos2"] = player_data["pos2"]
        row[f"awayP{idx}Pos3"] = player_data["pos3"]
        row[f"awayP{idx}Position"] = player_data["position"]
        row[f"awayP{idx}PositionCode"] = player_data["positionCode"]

    return row


def write_matches_csv(match_ids: list[int]) -> Path:
    """Write selected match summaries to matches.csv in the season output folder."""
    if not isinstance(match_ids, list) or not match_ids:
        raise RuntimeError("match_ids must be a non-empty list of integer match IDs.")

    for idx, match_id in enumerate(match_ids, start=1):
        if not isinstance(match_id, int) or isinstance(match_id, bool):
            raise RuntimeError(
                f"Invalid matchId at position {idx}: {match_id}. Expected integer."
            )

    competition_url = f"{API_BASE}/competitions/{COMPETITION_ID}"
    competition = fetch_json(competition_url)
    if not isinstance(competition, dict):
        raise RuntimeError("Competition payload is not an object.")

    filename = build_output_filename(competition)
    output_dir = Path(__file__).resolve().parent / filename.removesuffix(".csv")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "matches.csv"

    rows: list[dict[str, Any]] = []
    last_match_fetch_started_at: float | None = None
    for match_id in match_ids:
        if last_match_fetch_started_at is not None:
            elapsed = time.monotonic() - last_match_fetch_started_at
            wait_seconds = MATCH_FETCH_INTERVAL_SECONDS - elapsed
            if wait_seconds > 0:
                time.sleep(wait_seconds)

        last_match_fetch_started_at = time.monotonic()
        match_url = f"{API_BASE}/matches/{match_id}?withFormations=true"
        match_data = fetch_json(match_url)
        if not isinstance(match_data, dict):
            raise RuntimeError(f"Match payload is not an object for matchId={match_id}.")
        rows.append(_build_match_row(match_id, match_data))

    with output_path.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=MATCHES_CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    return output_path


def main() -> int:
    """Script entrypoint."""
    competition_url = f"{API_BASE}/competitions/{COMPETITION_ID}"
    competition = fetch_json(competition_url)
    groups = get_standings_groups(competition)
    rows = build_rows(competition)
    filename = build_output_filename(competition)
    output_dir = Path(__file__).resolve().parent / filename.removesuffix(".csv")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "standings.csv"
    write_csv(rows, output_path)

    competition_match_ids = sorted(collect_competition_match_ids(groups))
    if competition_match_ids:
        matches_output_path = write_matches_csv(competition_match_ids)
        print(f"Wrote {len(competition_match_ids)} match rows to {matches_output_path}")
    else:
        print("No played matches found in competition; skipped matches.csv")

    players_files_count = 0
    club_data_cache: dict[int, dict[str, Any]] = {}
    for row in rows:
        club_id = row["clubId"]
        if not isinstance(club_id, int):
            raise RuntimeError(f"Invalid clubId in standings row: {club_id}")
        players = fetch_club_players(club_id)
        club_data = fetch_club_info(club_id, club_data_cache)
        club_owner_wallet = None
        owned_by = club_data.get("ownedBy")
        if isinstance(owned_by, dict):
            club_owner_wallet = owned_by.get("walletAddress")

        player_rows = [player_to_csv_row(player, club_owner_wallet) for player in players]
        club_players_path = output_dir / f"{club_id}.csv"
        write_players_csv(player_rows, club_players_path)
        players_files_count += 1

    print(f"Wrote {len(rows)} rows to {output_path}")
    print(f"Wrote {players_files_count} club player files to {output_dir}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pylint: disable=broad-except
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1)
