FROM node:10-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-unstable'})
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true


# RUN apt-get install -qqy git
# RUN npm i npx

# RUN apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
# RUN sysctl -w kernel.unprivileged_userns_clone=1

# Install puppeteer so it's available in the container.
RUN npm i puppeteer &&\
    # Add user so we don't need --no-sandbox.
    # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
    groupadd -r behavioruser && useradd -r -g behavioruser -G audio,video behavioruser \
    && mkdir -p /home/behavioruser/Downloads \
    && chown -R behavioruser:behavioruser /home/behavioruser
    # && chown -R behavioruser:behavioruser /node_modules

# Run everything after as non-privileged user.
USER behavioruser

# CMD ["google-chrome-unstable"]


WORKDIR /home/behavioruser/

COPY . start-instrumented-chrome

# RUN git clone https://gitlab.com/quentinLeDilavrec/stage_m1.git
# ARG CACHEBUST=1

WORKDIR /home/behavioruser/start-instrumented-chrome/
RUN mkdir /tmp/behaviorlogs
RUN pwd && ls
RUN npm i

# CMD ["npm", "start"]
CMD ["npm", "run", "no-sandbox"]
