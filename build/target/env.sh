#!/bin/bash
#
# FeelHQ/feel-scripts/env.sh
# Copyright (C) 2017 Feel Foundation
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
######################################################################

export NODE_ENV="production"

FEEL_PATH=$( cd -P -- "$( dirname -- "${BASH_SOURCE[0]}" )" && pwd -P )

export PATH="$FEEL_PATH/bin:$FEEL_PATH/pgsql/bin:$PATH"
export PM2_HOME=$FEEL_PATH/.pm2
# FEEL_NETWORK is set at build time
